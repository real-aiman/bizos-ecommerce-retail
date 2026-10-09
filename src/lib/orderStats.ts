import type { Order } from "@/modules/orders/types";

export interface OrderStats { count: number; spent: number; saved: number; items: number; average: number }

export function orderStats(orders: Order[]): OrderStats {
  const spent = orders.reduce((s, o) => s + o.total, 0);
  return {
    count: orders.length,
    spent: Math.round(spent * 100) / 100,
    saved: Math.round(orders.reduce((s, o) => s + (o.discount ?? 0), 0) * 100) / 100,
    items: orders.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.quantity, 0), 0),
    average: orders.length ? Math.round((spent / orders.length) * 100) / 100 : 0
  };
}

export type OrderSort = "newest" | "oldest" | "highest";

/** Matches reference, product names, city and promo code. Case-insensitive. */
export function searchOrders(orders: Order[], q: string, sort: OrderSort = "newest"): Order[] {
  const needle = q.trim().toLowerCase();
  const rows = needle
    ? orders.filter((o) => [o.reference, o.customer.city, o.promoCode ?? "", ...o.lines.map((l) => l.name)].some((t) => t.toLowerCase().includes(needle)))
    : [...orders];
  return rows.sort((a, b) =>
    sort === "highest" ? b.total - a.total : sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)
  );
}
