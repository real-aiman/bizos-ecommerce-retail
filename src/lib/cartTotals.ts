import { store } from "@/config/store";
import { computeTotals, type Totals } from "@/lib/pricing";
import { checkPromo, type Promo } from "@/lib/promo";
import type { CartItem } from "@/stores/cartStore";

/** Totals for display. Promo problems (expired, below minimum) become a message instead of a discount. */
export function cartTotals(items: CartItem[], promo: Promo | null): { totals: Totals; promoMessage: string | null } {
  const lines = items.map((i) => ({ unitPrice: i.product.regularPrice, quantity: i.quantity }));
  const subtotal = computeTotals(lines).subtotal;
  const check = promo ? checkPromo(promo, subtotal) : null;
  return {
    totals: computeTotals(lines, store.shipping, check?.ok ? check.discount : 0),
    promoMessage: check && !check.ok ? check.message : null
  };
}
