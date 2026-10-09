"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useReorder } from "@/hooks/useReorder";
import { formatCurrency } from "@/lib/utils";
import { productToAnalyticsItem, trackPurchase } from "@/lib/analytics";

export function OrderSuccess({ reference }: { reference: string }) {
  const hydrated = useHydrated();
  const reorder = useReorder();
  const order = useOrderStore((s) => s.orders.find((o) => o.reference === reference));
  const alreadyTracked = useOrderStore((s) => s.tracked.includes(reference));
  const markTracked = useOrderStore((s) => s.markTracked);

  useEffect(() => {
    if (!order || alreadyTracked || !order.persisted) return;
    trackPurchase(
      order.reference,
      order.lines.map((l) => productToAnalyticsItem({ id: l.id, name: l.name, regularPrice: l.unitPrice, departmentName: "" }, l.quantity)),
      order.total,
      undefined,
      undefined,
      order.shipping
    );
    markTracked(order.reference);
  }, [order, alreadyTracked, markTracked]);

  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" />;

  if (!order) {
    return (
      <div className="empty-state">
        <h2>We can&apos;t find that order on this device</h2>
        <p>Orders are shown on the device they were placed from.</p>
        <Link href="/" className="btn btn-dark">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="panel success">
      <CheckCircle2 size={40} aria-hidden="true" />
      <h1>Thank you, {order.customer.fullName.split(" ")[0]}.</h1>
      <p className="print-only muted">{new Date(order.createdAt).toLocaleString()} · {order.customer.email} · {order.customer.phone}</p>
      <p className="lead">Order <strong>{order.reference}</strong> is placed. Keep {formatCurrency(order.total)} in cash ready for delivery.</p>
      {!order.persisted && <p className="banner">Demo order: it was not sent to a store backend.</p>}
      <ul className="mini-lines">
        {order.lines.map((l) => (
          <li key={l.id}><span>{l.quantity} × {l.name}</span><span /><span>{formatCurrency(l.unitPrice * l.quantity)}</span></li>
        ))}
      </ul>
      {!!order.discount && <p className="muted">Promo {order.promoCode} saved you {formatCurrency(order.discount)}.</p>}
      <p className="muted">Delivering to {order.customer.address}, {order.customer.city}</p>
      <div className="row">
        <Link href={`/dashboard/orders/${encodeURIComponent(order.reference)}`} className="btn btn-dark no-print">View order details</Link>
        <button type="button" className="btn btn-ghost no-print" onClick={() => window.print()}>Print invoice</button>
        <button type="button" className="btn btn-ghost no-print" onClick={() => reorder(order)}>Order again</button>
        <Link href="/" className="btn btn-ghost no-print">Continue shopping</Link>
      </div>
    </div>
  );
}
