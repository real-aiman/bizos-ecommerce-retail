import { describe, expect, it } from "vitest";
import { computeTotals } from "@/lib/pricing";
import { customerSchema, placeOrderSchema } from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";

describe("computeTotals", () => {
  it("adds flat shipping below the free threshold", () => {
    const t = computeTotals([{ unitPrice: 40, quantity: 2 }], { freeOver: 100, flatRate: 9.5 });
    expect(t).toEqual({ subtotal: 80, discount: 0, shipping: 9.5, total: 89.5, freeShippingRemaining: 20 });
  });
  it("ships free at or above the threshold", () => {
    expect(computeTotals([{ unitPrice: 100, quantity: 1 }], { freeOver: 100, flatRate: 9.5 })).toMatchObject({ shipping: 0, total: 100, freeShippingRemaining: null });
  });
  it("charges nothing for an empty cart and avoids float drift", () => {
    expect(computeTotals([], { freeOver: 0, flatRate: 5 }).total).toBe(0);
    expect(computeTotals([{ unitPrice: 0.1, quantity: 3 }], { freeOver: 0, flatRate: 0 }).subtotal).toBe(0.3);
  });
});

describe("validation", () => {
  const ok = { fullName: "Aiman Shafiq", email: "a@b.co", phone: "+92 300 1234567", address: "House 1", city: "Lahore" };
  it("accepts valid details and defaults optional fields", () => {
    expect(customerSchema.parse(ok)).toMatchObject({ postalCode: "", notes: "" });
  });
  it("rejects bad email and phone", () => {
    const r = customerSchema.safeParse({ ...ok, email: "nope", phone: "12" });
    expect(r.success).toBe(false);
  });
  it("rejects a filled honeypot and empty lines", () => {
    const base = { customer: ok, lines: [{ id: 1, quantity: 1 }], paymentMethod: "cod", expectedTotal: 1 };
    expect(placeOrderSchema.safeParse({ ...base, website: "spam" }).success).toBe(false);
    expect(placeOrderSchema.safeParse({ ...base, lines: [] }).success).toBe(false);
    expect(placeOrderSchema.safeParse(base).success).toBe(true);
  });
});

describe("formatCurrency", () => {
  it("drops decimals for whole amounts only", () => {
    expect(formatCurrency(599)).toBe("$599");
    expect(formatCurrency(599.5)).toBe("$599.50");
  });
});
