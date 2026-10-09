import { env } from "@/lib/env";
import type { Order } from "../types";

export class OrdersUnavailableError extends Error {}

/**
 * Sends the order to the BizOS backend.
 * NOTE: the payload below is this storefront's own shape. Align it with the real
 * order-creation contract of the BizOS API before going live.
 */
export async function submitOrder(order: Omit<Order, "persisted">): Promise<Order> {
  if (!env.bizosApiUrl || !env.bizosOrdersPath) {
    if (env.allowSimulatedOrders) return { ...order, persisted: false };
    throw new OrdersUnavailableError("No orders endpoint is configured.");
  }

  const base = env.bizosApiUrl.replace(/\/$/, "");
  const path = env.bizosOrdersPath.startsWith("/") ? env.bizosOrdersPath : `/${env.bizosOrdersPath}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Idempotency-Key": order.reference
  };
  if (env.bizosApiKey) headers.Authorization = `Bearer ${env.bizosApiKey}`;

  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(order),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`Order request failed with ${response.status}.`);

  const body = (await response.json().catch(() => ({}))) as { reference?: unknown; orderNumber?: unknown };
  const remote = body.reference ?? body.orderNumber;
  return { ...order, reference: typeof remote === "string" || typeof remote === "number" ? String(remote) : order.reference, persisted: true };
}
