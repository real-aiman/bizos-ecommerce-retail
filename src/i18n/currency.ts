import { currencyByLocale, defaultLocale, isLocale, type Locale } from "./config";

export type CurrencyCode = "USD" | "PKR" | "EUR" | "GBP";

export interface CurrencyOptions {
  currency?: CurrencyCode;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function getCurrencyForLocale(locale: Locale): CurrencyCode {
  return currencyByLocale[locale];
}

export function formatCurrency(
  value: number,
  options: CurrencyOptions = {}
): string {
  const locale = options.locale ?? "en-US";
  const localeKey = locale.split("-")[0];
  const currency =
    options.currency ??
    (isLocale(localeKey) ? getCurrencyForLocale(localeKey) : currencyByLocale[defaultLocale]);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2
  }).format(value);
}
