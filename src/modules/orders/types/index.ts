export interface OrderLine {
  id: number;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  reference: string;
  createdAt: string;
  customer: { fullName: string; email: string; phone: string; address: string; city: string; postalCode: string; notes: string };
  lines: OrderLine[];
  subtotal: number;
  /** Absent on orders saved before promo codes existed. */
  discount?: number;
  promoCode?: string;
  shipping: number;
  total: number;
  paymentMethod: "cod";
  /** false when the order was accepted in simulated mode and never reached a backend. */
  persisted: boolean;
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; code: "INVALID" | "PROMO_INVALID" | "PRICE_CHANGED" | "UNAVAILABLE" | "ORDERS_UNAVAILABLE" | "FAILED"; message: string; fieldErrors?: Record<string, string>; prices?: Record<number, number> };
