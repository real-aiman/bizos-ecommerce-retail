"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useHydrated } from "@/hooks/useHydrated";
import { cartTotals } from "@/lib/cartTotals";
import { formatCurrency } from "@/lib/utils";
import { QuantityStepper } from "./QuantityStepper";
import { FreeShippingProgress } from "./FreeShippingProgress";
import { OrderTotals } from "./OrderTotals";
import { PromoCode } from "./PromoCode";

export function CartView() {
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);
  const promo = useCartStore((s) => s.promo);
  const hydrated = useHydrated();

  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" aria-label="Loading cart" />;

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add something from the catalog and it will wait for you here.</p>
        <Link href="/#catalog" className="btn btn-dark">Start shopping</Link>
      </div>
    );
  }

  const { totals, promoMessage } = cartTotals(items, promo);

  return (
    <div className="split">
      <section className="panel" aria-label="Items in your cart">
        <ul className="cart-list">
          {items.map(({ product, quantity }) => (
            <li className="cart-row" key={product.id}>
              <Link href={`/products/${product.slug}`} className="cart-thumb">
                <Image src={product.productImageUrl} alt="" fill sizes="96px" />
              </Link>
              <div className="cart-info">
                <Link href={`/products/${product.slug}`}><strong>{product.name}</strong></Link>
                <span className="muted">{formatCurrency(product.regularPrice)} each</span>
                <QuantityStepper value={quantity} onChange={(n) => setQuantity(product.id, n)} label={`Quantity of ${product.name}`} />
              </div>
              <div className="cart-line">
                <strong>{formatCurrency(product.regularPrice * quantity)}</strong>
                <button type="button" className="link-danger" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}>
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="link-danger" onClick={clear}>Clear cart</button>
      </section>
      <aside className="panel summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <FreeShippingProgress subtotal={totals.subtotal} />
        <PromoCode message={promoMessage} />
        <OrderTotals totals={totals} />
        <Link href="/checkout" className="btn btn-gold btn-lg">Checkout</Link>
        <Link href="/#catalog" className="btn btn-ghost">Keep shopping</Link>
      </aside>
    </div>
  );
}
