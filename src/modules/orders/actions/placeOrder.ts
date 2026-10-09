"use server";

import { randomUUID } from "node:crypto";
import { computeTotals } from "@/lib/pricing";
import { env } from "@/lib/env";
import { checkPromo, findPromo, parsePromos } from "@/lib/promo";
import { fieldErrors, placeOrderSchema, type PlaceOrderInput } from "@/lib/validation";
import { reportError } from "@/lib/error-handling";
import { getAllProducts } from "@/modules/products/services/productService";
import { OrdersUnavailableError, submitOrder } from "../services/orderGateway";
import type { OrderLine, PlaceOrderResult } from "../types";

const newReference = () => `BZ-${Date.now().toString(36).toUpperCase()}${randomUUID().slice(0, 4).toUpperCase()}`;

/**
 * Never trusts client prices: every line is re-priced from the catalog on the server.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "INVALID", message: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const { customer, lines, expectedTotal, website, promoCode } = parsed.data;

  if (website) {
    // Bot trap: look successful, send nothing.
    return { ok: false, code: "FAILED", message: "We could not place this order. Please try again." };
  }

  try {
    const catalog = await getAllProducts();
    const bySlugId = new Map(catalog.map((product) => [product.id, product]));
    const missing = lines.filter((line) => !bySlugId.has(line.id));
    if (missing.length) {
      return { ok: false, code: "UNAVAILABLE", message: "Some items in your cart are no longer available. Remove them and try again." };
    }

    const orderLines: OrderLine[] = lines.map((line) => {
      const product = bySlugId.get(line.id)!;
      return { id: product.id, slug: product.slug, name: product.name, image: product.productImageUrl, unitPrice: product.regularPrice, quantity: line.quantity };
    });
    const subtotal = computeTotals(orderLines).subtotal;
    let discount = 0;
    let appliedCode: string | undefined;
    if (promoCode) {
      const promo = findPromo(parsePromos(env.promoCodes), promoCode);
      const check = promo ? checkPromo(promo, subtotal) : null;
      if (!promo || !check) return { ok: false, code: "PROMO_INVALID", message: "That promo code is not valid any more. Remove it and try again." };
      if (!check.ok) return { ok: false, code: "PROMO_INVALID", message: check.message };
      discount = check.discount;
      appliedCode = promo.code;
    }
    const totals = computeTotals(orderLines, undefined, discount);

    if (Math.abs(totals.total - expectedTotal) > 0.009) {
      return {
        ok: false,
        code: "PRICE_CHANGED",
        message: "Some prices changed since you added these items. Review your updated total and place the order again.",
        prices: Object.fromEntries(orderLines.map((line) => [line.id, line.unitPrice]))
      };
    }

    const order = await submitOrder({
      reference: newReference(),
      createdAt: new Date().toISOString(),
      customer,
      lines: orderLines,
      subtotal: totals.subtotal,
      ...(appliedCode ? { discount: totals.discount, promoCode: appliedCode } : {}),
      shipping: totals.shipping,
      total: totals.total,
      paymentMethod: "cod"
    });
    return { ok: true, order };
  } catch (error) {
    if (error instanceof OrdersUnavailableError) {
      reportError(error);
      return { ok: false, code: "ORDERS_UNAVAILABLE", message: "Online ordering is not available right now. Please contact us to place your order." };
    }
    reportError(error, { scope: "placeOrder" });
    return { ok: false, code: "FAILED", message: "We could not place your order. Nothing was charged. Please try again." };
  }
}
