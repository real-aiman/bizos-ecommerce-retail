"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Banknote, CreditCard } from "lucide-react";
import { store } from "@/config/store";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useHydrated } from "@/hooks/useHydrated";
import { cartTotals } from "@/lib/cartTotals";
import { customerSchema, fieldErrors } from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";
import { productToAnalyticsItem, trackBeginCheckout } from "@/lib/analytics";
import { placeOrder } from "@/modules/orders/actions/placeOrder";
import { useProfileStore } from "@/stores/profileStore";
import { OrderTotals } from "./OrderTotals";
import { PromoCode } from "./PromoCode";
import { FreeShippingProgress } from "./FreeShippingProgress";

type Errors = Record<string, string>;

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <p className="field-error" id={`${name}-error`}>{error}</p>}
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const syncPrices = useCartStore((s) => s.syncPrices);
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const addresses = useProfileStore((s) => s.addresses);
  const [chosen, setChosen] = useState(0);
  const saved = addresses[chosen];
  const saveProfile = useProfileStore((s) => s.save);
  const addOrder = useOrderStore((s) => s.add);
  const hydrated = useHydrated();
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState("");
  const [pending, startTransition] = useTransition();
  const tracked = useRef(false);

  const { totals, promoMessage } = cartTotals(items, promo);

  useEffect(() => {
    if (!hydrated || !items.length || tracked.current) return;
    tracked.current = true;
    trackBeginCheckout(items.map((i) => productToAnalyticsItem(i.product, i.quantity)), totals.total);
  }, [hydrated, items, totals.total]);

  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" aria-label="Loading checkout" />;

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add a product before checking out.</p>
        <Link href="/#catalog" className="btn btn-dark">Browse products</Link>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(["fullName", "email", "phone", "address", "city", "postalCode", "notes"].map((k) => [k, String(form.get(k) ?? "")]));
    const parsed = customerSchema.safeParse(raw);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      setBanner("Please fix the highlighted fields.");
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setErrors({});
    setBanner("");

    startTransition(async () => {
      const result = await placeOrder({
        customer: parsed.data,
        lines: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
        paymentMethod: "cod",
        expectedTotal: totals.total,
        promoCode: promo && !promoMessage ? promo.code : "",
        website: String(form.get("website") ?? "")
      });
      if (result.ok) {
        if (form.get("remember")) {
          const { fullName, email, phone, address, city, postalCode } = parsed.data;
          saveProfile({ fullName, email, phone, address, city, postalCode });
        }
        addOrder(result.order);
        clear();
        router.push(`/checkout/success?ref=${encodeURIComponent(result.order.reference)}`);
        return;
      }
      if (result.fieldErrors) setErrors(result.fieldErrors);
      if (result.code === "PROMO_INVALID") setPromo(null);
      if (result.code === "PRICE_CHANGED" && result.prices) syncPrices(result.prices);
      setBanner(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const err = (n: string) => errors[n];
  const aria = (n: string) => ({ "aria-invalid": err(n) ? true : undefined, "aria-describedby": err(n) ? `${n}-error` : undefined });

  return (
    <form className="split" onSubmit={onSubmit} noValidate>
      <div className="panel">
        {banner && <p className="banner" role="alert">{banner}</p>}
        <h2>Delivery details</h2>
        {addresses.length > 1 && (
          <div className="field">
            <label htmlFor="saved-address">Deliver to</label>
            <select id="saved-address" value={chosen} onChange={(e) => setChosen(Number(e.target.value))}>
              {addresses.map((a, i) => <option key={a.id} value={i}>{a.fullName} — {a.address}, {a.city}</option>)}
              <option value={-1}>A new address</option>
            </select>
          </div>
        )}
        <div className="form-grid" key={saved?.id ?? "new"}>
          <Field name="fullName" label="Full name" error={err("fullName")}><input id="fullName" name="fullName" defaultValue={saved?.fullName} autoComplete="name" required {...aria("fullName")} /></Field>
          <Field name="phone" label="Phone" error={err("phone")}><input id="phone" name="phone" defaultValue={saved?.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+92 300 1234567" required {...aria("phone")} /></Field>
          <div className="span-2"><Field name="email" label="Email" error={err("email")}><input id="email" name="email" defaultValue={saved?.email} type="email" autoComplete="email" required {...aria("email")} /></Field></div>
          <div className="span-2"><Field name="address" label="Delivery address" error={err("address")}><input id="address" name="address" defaultValue={saved?.address} autoComplete="street-address" required {...aria("address")} /></Field></div>
          <Field name="city" label="City" error={err("city")}><input id="city" name="city" defaultValue={saved?.city} autoComplete="address-level2" required {...aria("city")} /></Field>
          <Field name="postalCode" label="Postal code (optional)" error={err("postalCode")}><input id="postalCode" name="postalCode" defaultValue={saved?.postalCode} autoComplete="postal-code" {...aria("postalCode")} /></Field>
          <div className="span-2"><Field name="notes" label="Delivery notes (optional)" error={err("notes")}><input id="notes" name="notes" {...aria("notes")} /></Field></div>
        </div>
        <label className="remember"><input type="checkbox" name="remember" defaultChecked /> Remember these details on this device</label>
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <h2>Payment</h2>
        <label className="pay selected">
          <input type="radio" name="payment" defaultChecked readOnly />
          <Banknote size={22} />
          <span><strong>Cash on delivery</strong><small>Pay {formatCurrency(totals.total)} in cash when your order arrives.</small></span>
        </label>
        {!store.payments.online && (
          <div className="pay disabled" aria-disabled="true">
            <CreditCard size={22} />
            <span><strong>Card or wallet</strong><small>Not available yet.</small></span>
          </div>
        )}
      </div>

      <aside className="panel summary" aria-label="Order summary">
        <h2>Your order</h2>
        <ul className="mini-lines">
          {items.map(({ product, quantity }) => (
            <li key={product.id}>
              <span className="mini-thumb"><Image src={product.productImageUrl} alt="" fill sizes="52px" /><b>{quantity}</b></span>
              <span>{product.name}</span>
              <span>{formatCurrency(product.regularPrice * quantity)}</span>
            </li>
          ))}
        </ul>
        <FreeShippingProgress subtotal={totals.subtotal} />
        <PromoCode message={promoMessage} />
        <OrderTotals totals={totals} />
        <button className="btn btn-gold btn-lg" type="submit" disabled={pending}>{pending ? "Placing order…" : `Place order · ${formatCurrency(totals.total)}`}</button>
        <Link href="/cart" className="btn btn-ghost">Back to cart</Link>
      </aside>
    </form>
  );
}
