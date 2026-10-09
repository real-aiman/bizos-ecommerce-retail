"use client";

import Link from "next/link";
import { useOrderStore } from "@/stores/orderStore";
import { useProfileStore } from "@/stores/profileStore";
import { useHydrated } from "@/hooks/useHydrated";
import { orderStats } from "@/lib/orderStats";
import { formatCurrency } from "@/lib/utils";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { OrderRow } from "./OrderRow";

export function DashboardOverview() {
  const hydrated = useHydrated();
  const orders = useOrderStore((s) => s.orders);
  const addresses = useProfileStore((s) => s.addresses);
  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" />;

  const stats = orderStats(orders);
  const name = (addresses[0]?.fullName ?? orders[0]?.customer.fullName ?? "").split(" ")[0];
  const kpis: [string, string][] = [
    ["Orders", String(stats.count)],
    ["Total spent", formatCurrency(stats.spent)],
    ["Items bought", String(stats.items)],
    ["Saved with promos", formatCurrency(stats.saved)]
  ];

  return (
    <>
      <h1 className="page-title">{name ? `Welcome back, ${name}` : "My dashboard"}</h1>
      <p className="banner info">There are no customer logins yet, so this dashboard shows the orders and details saved on this device.</p>
      <div className="kpi-grid">{kpis.map(([label, value]) => <div className="kpi" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>

      <section className="panel" aria-labelledby="recent-orders-h">
        <div className="section-row">
          <h2 id="recent-orders-h">Recent orders</h2>
          {orders.length > 3 && <Link href="/dashboard/orders" className="underline">View all {orders.length}</Link>}
        </div>
        {orders.length === 0 ? (
          <div className="empty-inline"><p className="muted">You haven&apos;t placed an order from this device yet.</p><Link href="/#catalog" className="btn btn-dark btn-sm">Start shopping</Link></div>
        ) : (
          <ul className="order-list">{orders.slice(0, 3).map((o) => <OrderRow key={o.reference} order={o} />)}</ul>
        )}
      </section>

      <RecentlyViewed />
    </>
  );
}
