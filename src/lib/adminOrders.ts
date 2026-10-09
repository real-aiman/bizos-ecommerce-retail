import { env } from "@/lib/env";

export interface AdminOrder { reference: string; date: string; customer: string; total: number; status: string }

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const str = (v: unknown, fallback = "") => (typeof v === "string" || typeof v === "number" ? String(v) : fallback);

/** Tolerant mapping: backends differ, so accept the common field names and drop the rest. */
export function normalizeOrders(payload: unknown): AdminOrder[] {
  const src = payload as { data?: unknown; orders?: unknown; items?: unknown };
  const list = Array.isArray(payload) ? payload : Array.isArray(src?.data) ? src.data : Array.isArray(src?.orders) ? src.orders : Array.isArray(src?.items) ? src.items : [];
  return (list as Record<string, unknown>[]).filter((o) => o && typeof o === "object").map((o) => {
    const customer = o.customer as Record<string, unknown> | undefined;
    return {
      reference: str(o.reference ?? o.orderNumber ?? o.id, "—"),
      date: str(o.createdAt ?? o.date ?? o.orderDate),
      customer: str(customer?.fullName ?? o.customerName ?? o.customer),
      total: num(o.total ?? o.grandTotal ?? o.amount),
      status: str(o.status, "—")
    };
  });
}

export type OrdersResult = { state: "unconfigured" } | { state: "error"; message: string } | { state: "ok"; orders: AdminOrder[] };

export async function fetchAdminOrders(): Promise<OrdersResult> {
  if (!env.bizosApiUrl || !env.bizosOrdersListPath) return { state: "unconfigured" };
  const base = env.bizosApiUrl.replace(/\/$/, "");
  const path = env.bizosOrdersListPath.startsWith("/") ? env.bizosOrdersListPath : `/${env.bizosOrdersListPath}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (env.bizosApiKey) headers.Authorization = `Bearer ${env.bizosApiKey}`;
  try {
    const res = await fetch(`${base}${path}`, { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return { state: "error", message: `The orders endpoint answered ${res.status}.` };
    return { state: "ok", orders: normalizeOrders(await res.json()) };
  } catch {
    return { state: "error", message: "Could not reach the orders endpoint." };
  }
}
