"use client";

import Image from "next/image";
import Link from "next/link";
import { useReorder } from "@/hooks/useReorder";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/modules/orders/types";

export const orderDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function OrderRow({ order }: { order: Order }) {
  const reorder = useReorder();
  const href = `/dashboard/orders/${encodeURIComponent(order.reference)}`;
  const units = order.lines.reduce((n, l) => n + l.quantity, 0);
  return (
    <li className="order-card">
      <div className="order-card-head">
        <span><Link href={href} className="underline"><strong>{order.reference}</strong></Link><small className="muted">{orderDate(order.createdAt)} · {units} {units === 1 ? "item" : "items"}</small></span>
        <span className="order-card-total"><strong>{formatCurrency(order.total)}</strong><small className="pill-ok">Cash on delivery</small></span>
      </div>
      <div className="order-thumbs">
        {order.lines.slice(0, 5).map((l) => <span key={l.id} className="mini-thumb"><Image src={l.image} alt={l.name} fill sizes="52px" /></span>)}
        {order.lines.length > 5 && <span className="muted">+{order.lines.length - 5} more</span>}
      </div>
      <div className="row">
        <Link href={href} className="btn btn-dark btn-sm">View details</Link>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => reorder(order)}>Order again</button>
      </div>
    </li>
  );
}
