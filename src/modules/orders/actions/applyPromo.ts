"use server";

import { z } from "zod";
import { env } from "@/lib/env";
import { computeTotals } from "@/lib/pricing";
import { checkPromo, findPromo, parsePromos, type Promo } from "@/lib/promo";
import { getAllProducts } from "@/modules/products/services/productService";

const linesSchema = z.array(z.object({ id: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).min(1).max(50);

export type ApplyPromoResult = { ok: true; promo: Promo; discount: number } | { ok: false; message: string };

/** Checks a code against the real catalog subtotal. The cart only stores the returned terms. */
export async function applyPromo(code: string, lines: { id: number; quantity: number }[]): Promise<ApplyPromoResult> {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success || !code.trim() || code.length > 32) return { ok: false, message: "Enter a promo code." };
  const promo = findPromo(parsePromos(env.promoCodes), code);
  if (!promo) return { ok: false, message: "That code isn't valid." };
  const byId = new Map((await getAllProducts()).map((p) => [p.id, p]));
  const subtotal = computeTotals(parsed.data.flatMap((l) => (byId.has(l.id) ? [{ unitPrice: byId.get(l.id)!.regularPrice, quantity: l.quantity }] : []))).subtotal;
  const check = checkPromo(promo, subtotal);
  return check.ok ? { ok: true, promo, discount: check.discount } : { ok: false, message: check.message };
}
