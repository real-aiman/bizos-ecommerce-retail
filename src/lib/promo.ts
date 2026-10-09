import { z } from "zod";

export const promoSchema = z.object({
  code: z.string().trim().min(2).max(32),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive(),
  minSubtotal: z.number().nonnegative().optional().default(0),
  maxDiscount: z.number().positive().optional(),
  /** ISO date (inclusive, end of that day UTC). Empty means no expiry. */
  expires: z.string().optional(),
  /** Listed on /deals when true. Unlisted codes still work if the shopper knows them. */
  public: z.boolean().optional()
});

export type Promo = z.infer<typeof promoSchema>;

export type PromoCheck = { ok: true; discount: number } | { ok: false; message: string };

const cents = (value: number) => Math.round(value * 100) / 100;

/** Reads the BIZOS_PROMO_CODES JSON. Invalid entries are dropped, never thrown. */
export function parsePromos(raw: string): Promo[] {
  if (!raw.trim()) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.flatMap((entry) => {
      const parsed = promoSchema.safeParse(entry);
      return parsed.success ? [parsed.data] : [];
    });
  } catch {
    return [];
  }
}

export function findPromo(promos: Promo[], code: string): Promo | undefined {
  const wanted = code.trim().toUpperCase();
  return wanted ? promos.find((promo) => promo.code.toUpperCase() === wanted) : undefined;
}

/** Pure check used by both the server (authoritative) and the cart (display only). */
export function checkPromo(promo: Promo, subtotal: number, now = new Date()): PromoCheck {
  if (promo.expires) {
    const end = new Date(`${promo.expires}T23:59:59Z`);
    if (Number.isNaN(end.getTime()) || now > end) return { ok: false, message: `Code ${promo.code} has expired.` };
  }
  if (subtotal < (promo.minSubtotal ?? 0)) {
    return { ok: false, message: `Code ${promo.code} needs a subtotal of at least ${promo.minSubtotal}.` };
  }
  const raw = promo.type === "percent" ? (subtotal * Math.min(promo.value, 100)) / 100 : promo.value;
  const capped = promo.maxDiscount ? Math.min(raw, promo.maxDiscount) : raw;
  return { ok: true, discount: cents(Math.min(capped, subtotal)) };
}
