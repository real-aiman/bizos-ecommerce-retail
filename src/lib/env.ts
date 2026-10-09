function requiredInProduction(name: string, value: string | undefined, skip: boolean): string {
  if (!value && !skip && process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production.`);
  }
  return value ?? "";
}

const devFallback = process.env.BIZOS_DEV_FALLBACK === "true";

export const env = {
  // BIZOS_API_URL is required in production unless BIZOS_DEV_FALLBACK=true.
  bizosApiUrl: requiredInProduction("BIZOS_API_URL", process.env.BIZOS_API_URL, devFallback),
  bizosProductsPath: process.env.BIZOS_PRODUCTS_PATH || "/products",
  /** Optional GET endpoint that lists orders, used only by the admin dashboard. */
  bizosOrdersListPath: process.env.BIZOS_ORDERS_LIST_PATH || "",
  /** Admin dashboard password. Empty disables /admin entirely. */
  adminPassword: process.env.ADMIN_PASSWORD || "",
  /** Optional extra secret for signing admin sessions. */
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET || "",
  /** Where new orders are POSTed. Empty means orders cannot be persisted. */
  bizosOrdersPath: process.env.BIZOS_ORDERS_PATH || "",
  bizosApiKey: process.env.BIZOS_API_KEY || "",
  /** Explicit opt-in to accept orders that are NOT sent to any backend (local demos only). */
  allowSimulatedOrders: process.env.BIZOS_ALLOW_SIMULATED_ORDERS === "true",
  /** JSON array of promo codes, e.g. [{"code":"WELCOME10","type":"percent","value":10}]. Empty disables promos. */
  promoCodes: process.env.BIZOS_PROMO_CODES || "",
  devFallback,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
};
