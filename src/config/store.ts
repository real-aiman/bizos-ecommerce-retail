import type { CurrencyCode } from "@/i18n/currency";

const num = (value: string | undefined, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== "" ? parsed : fallback;
};

/**
 * Single place for business facts. Anything left empty is simply hidden in the UI,
 * so the storefront never shows a promise the business has not made.
 */
export const store = {
  name: "BizOS Retail",
  wordmark: "BIZOS",
  currency: (process.env.NEXT_PUBLIC_CURRENCY || "USD") as CurrencyCode,
  locale: process.env.NEXT_PUBLIC_LOCALE || "en-US",
  /** Optional: slug of the product shown in the home hero. Defaults to the first product. */
  featuredSlug: process.env.NEXT_PUBLIC_FEATURED_SLUG || "",
  hero: {
    headline: "Laptops, phones and electric rides.",
    lead: "Browse the full catalog, pay when it arrives, and keep your cart and wishlist saved on this device."
  },
  shipping: {
    /** Orders at or above this subtotal ship free. 0 disables the offer. */
    freeOver: num(process.env.NEXT_PUBLIC_FREE_SHIPPING_OVER),
    flatRate: num(process.env.NEXT_PUBLIC_SHIPPING_FLAT)
  },
  payments: { cashOnDelivery: true, online: false },
  contact: {
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "",
    address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "",
    hours: process.env.NEXT_PUBLIC_SUPPORT_HOURS || ""
  },
  /** Plain-language policy text. Leave empty until the business has decided. */
  policies: {
    delivery: "",
    returns: ""
  },
  limits: { maxQuantity: 99, pageSize: 12 }
} as const;

export const hasContact = Boolean(
  store.contact.email || store.contact.phone || store.contact.whatsapp
);
