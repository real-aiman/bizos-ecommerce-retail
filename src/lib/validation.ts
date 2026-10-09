import { z } from "zod";
import { store } from "@/config/store";

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const customerSchema = z.object({
  fullName: text("Full name", 80),
  email: z.string().trim().email("Enter a valid email address").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,18}$/, "Enter a valid phone number"),
  address: text("Delivery address", 200),
  city: text("City", 60),
  postalCode: z.string().trim().max(12, "Postal code is too long").optional().default(""),
  notes: z.string().trim().max(300, "Notes are too long").optional().default("")
});

export type CustomerDetails = z.infer<typeof customerSchema>;

export const placeOrderSchema = z.object({
  customer: customerSchema,
  lines: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(store.limits.maxQuantity)
      })
    )
    .min(1, "Your cart is empty")
    .max(50),
  paymentMethod: z.literal("cod"),
  expectedTotal: z.number().nonnegative(),
  promoCode: z.string().trim().max(32).optional().default(""),
  /** Honeypot: real shoppers never fill this in. */
  website: z.string().max(0).optional().default("")
});

export type PlaceOrderInput = z.input<typeof placeOrderSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[issue.path.length - 1] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
