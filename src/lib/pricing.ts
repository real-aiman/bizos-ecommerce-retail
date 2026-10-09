import { store } from "@/config/store";

export interface PricedLine {
  unitPrice: number;
  quantity: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number | null;
}

const cents = (value: number) => Math.round(value * 100) / 100;

export function computeTotals(lines: PricedLine[], config = store.shipping, discount = 0): Totals {
  const subtotal = cents(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const off = Math.min(cents(Math.max(0, discount)), subtotal);
  const qualifiesForFree = config.freeOver > 0 && subtotal >= config.freeOver;
  const shipping = subtotal === 0 || qualifiesForFree ? 0 : cents(config.flatRate);
  return {
    subtotal,
    discount: off,
    shipping,
    total: cents(subtotal - off + shipping),
    freeShippingRemaining:
      config.freeOver > 0 && subtotal > 0 && !qualifiesForFree ? cents(config.freeOver - subtotal) : null
  };
}
