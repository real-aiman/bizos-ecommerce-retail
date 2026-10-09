export const locales = ["en", "ur"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const currencyByLocale: Record<Locale, "USD" | "PKR"> = {
  en: "USD",
  ur: "PKR"
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
