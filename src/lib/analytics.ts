import { store } from "@/config/store";
import type { AnalyticsEvent, EcommerceEventMap, EcommerceItem } from "@/types/analytics";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

type Mixpanel = typeof import("mixpanel-browser").default;
let mixpanelReady: Promise<Mixpanel> | null = null;

/** Mixpanel is only downloaded when a token is configured. */
export function withMixpanel(fn: (mixpanel: Mixpanel) => void): void {
  if (!MIXPANEL_TOKEN || typeof window === "undefined") return;
  mixpanelReady ??= import("mixpanel-browser").then((mod) => {
    mod.default.init(MIXPANEL_TOKEN, { persistence: "localStorage", track_pageview: false });
    return mod.default;
  });
  void mixpanelReady.then(fn).catch(() => undefined);
}

export function productToAnalyticsItem(
  product: { id: number; name: string; regularPrice: number; departmentName: string },
  quantity = 1
): EcommerceItem {
  return { item_id: String(product.id), item_name: product.name, price: product.regularPrice, quantity, item_category: product.departmentName };
}

export function trackEvent<E extends AnalyticsEvent>(event: E, payload: EcommerceEventMap[E]): void {
  if (typeof window === "undefined") return;
  const data = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
  window.dataLayer?.push({ event, ecommerce: data });
  if (window.gtag && GA4_ID) window.gtag("event", event, data);
  withMixpanel((m) => m.track(event, data));
}

export function trackViewItem(item: EcommerceItem, currency: string = store.currency): void {
  trackEvent("view_item", { currency, value: item.price, items: [item] });
}

export function trackAddToCart(item: EcommerceItem, currency: string = store.currency): void {
  trackEvent("add_to_cart", { currency, value: item.price * (item.quantity ?? 1), items: [item] });
}

export function trackBeginCheckout(items: EcommerceItem[], value: number, currency: string = store.currency): void {
  trackEvent("begin_checkout", { currency, value, items });
}

export function trackPurchase(
  transactionId: string,
  items: EcommerceItem[],
  value: number,
  currency: string = store.currency,
  tax?: number,
  shipping?: number
): void {
  trackEvent("purchase", {
    transaction_id: transactionId,
    currency,
    value,
    items,
    ...(tax === undefined ? {} : { tax }),
    ...(shipping === undefined ? {} : { shipping })
  });
}
