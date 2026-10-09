import type { Totals } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

export function OrderTotals({ totals }: { totals: Totals }) {
  return (
    <dl className="totals">
      <div><dt>Subtotal</dt><dd>{formatCurrency(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="discount"><dt>Promo</dt><dd>−{formatCurrency(totals.discount)}</dd></div>}
      <div><dt>Delivery</dt><dd>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</dd></div>
      <div className="grand"><dt>Total</dt><dd>{formatCurrency(totals.total)}</dd></div>
    </dl>
  );
}
