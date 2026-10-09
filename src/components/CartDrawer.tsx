"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUiStore } from "@/stores/uiStore";
import { useHydrated } from "@/hooks/useHydrated";
import { cartTotals } from "@/lib/cartTotals";
import { formatCurrency } from "@/lib/utils";
import { QuantityStepper } from "./QuantityStepper";
import { FreeShippingProgress } from "./FreeShippingProgress";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const promo = useCartStore((s) => s.promo);
  const remove = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const hydrated = useHydrated();
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { close(); }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;
  const { totals } = cartTotals(items, promo);

  return (
    <>
      <button type="button" className="drawer-backdrop" aria-label="Close cart" onClick={close} tabIndex={-1} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Close cart" onClick={close}><X size={20} /></button>
        </div>
        {!hydrated || !items.length ? (
          <div className="drawer-empty">
            <p>{hydrated ? "Your cart is empty." : "Loading…"}</p>
            <Link href="/#catalog" className="btn btn-dark" onClick={close}>Start shopping</Link>
          </div>
        ) : (
          <>
            <ul className="drawer-list">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="drawer-row">
                  <Link href={`/products/${product.slug}`} className="mini-thumb" onClick={close}><Image src={product.productImageUrl} alt="" fill sizes="52px" /></Link>
                  <div className="drawer-info">
                    <Link href={`/products/${product.slug}`} onClick={close}><strong>{product.name}</strong></Link>
                    <span className="muted">{formatCurrency(product.regularPrice * quantity)}</span>
                    <QuantityStepper value={quantity} onChange={(n) => setQuantity(product.id, n)} label={`Quantity of ${product.name}`} />
                  </div>
                  <button type="button" className="icon-btn" aria-label={`Remove ${product.name}`} onClick={() => remove(product.id)}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <FreeShippingProgress subtotal={totals.subtotal} />
              <p className="drawer-sub"><span>Subtotal{totals.discount > 0 ? " (after promo)" : ""}</span><strong>{formatCurrency(totals.subtotal - totals.discount)}</strong></p>
              <Link href="/checkout" className="btn btn-gold btn-lg" onClick={close}>Checkout</Link>
              <Link href="/cart" className="btn btn-ghost" onClick={close}>View full cart</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
