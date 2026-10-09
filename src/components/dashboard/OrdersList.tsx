"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrderStore } from "@/stores/orderStore";
import { useHydrated } from "@/hooks/useHydrated";
import { orderStats, searchOrders, type OrderSort } from "@/lib/orderStats";
import { formatCurrency } from "@/lib/utils";
import { OrderRow } from "./OrderRow";

export function OrdersList() {
  const hydrated = useHydrated();
  const orders = useOrderStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<OrderSort>("newest");
  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" />;

  const rows = searchOrders(orders, q, sort);
  const stats = orderStats(orders);

  return (
    <>
      <h1 className="page-title">Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state"><h2>No orders yet</h2><p>Orders you place from this device will show up here with full details.</p><Link href="/#catalog" className="btn btn-dark">Browse products</Link></div>
      ) : (
        <>
          <p className="muted">{stats.count} {stats.count === 1 ? "order" : "orders"} · {formatCurrency(stats.spent)} in total · average {formatCurrency(stats.average)}. The latest 20 orders are kept on this device.</p>
          <div className="admin-filters">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number or product" aria-label="Search orders" />
            <select value={sort} onChange={(e) => setSort(e.target.value as OrderSort)} aria-label="Sort orders">
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest total</option>
            </select>
          </div>
          <p className="muted" aria-live="polite">{rows.length} shown</p>
          {rows.length ? <ul className="order-list">{rows.map((o) => <OrderRow key={o.reference} order={o} />)}</ul> : <p className="muted">No orders match “{q}”.</p>}
        </>
      )}
    </>
  );
}
