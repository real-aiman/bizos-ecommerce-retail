import { store } from "@/config/store";
import { formatCurrency as formatLocalizedCurrency } from "@/i18n/currency";

export function formatCurrency(value: number): string {
  const whole = Number.isInteger(value);
  return formatLocalizedCurrency(value, {
    locale: store.locale,
    currency: store.currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2
  });
}

export { formatLocalizedCurrency };

export function clampPage(page: number, total: number, pageSize: number): number {
  const max = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(Math.max(page, 1), max);
}
