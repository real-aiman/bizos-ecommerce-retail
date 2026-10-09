import { describe, expect, it } from "vitest";
import { checkPromo, findPromo, parsePromos } from "@/lib/promo";
import { computeTotals } from "@/lib/pricing";

const shipping = { freeOver: 0, flatRate: 5 };

describe("parsePromos", () => {
  it("drops malformed entries and bad JSON without throwing", () => {
    expect(parsePromos("not json")).toEqual([]);
    expect(parsePromos("")).toEqual([]);
    const list = parsePromos(JSON.stringify([{ code: "A1", type: "fixed", value: 5 }, { code: "", type: "x" }]));
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ code: "A1", minSubtotal: 0 });
  });
});

describe("checkPromo", () => {
  const pct = { code: "TEN", type: "percent" as const, value: 10, minSubtotal: 100, maxDiscount: 15 };
  it("computes percent discounts with a cap", () => {
    expect(checkPromo(pct, 100)).toEqual({ ok: true, discount: 10 });
    expect(checkPromo(pct, 1000)).toEqual({ ok: true, discount: 15 });
  });
  it("enforces minimum subtotal and expiry", () => {
    expect(checkPromo(pct, 50)).toMatchObject({ ok: false });
    expect(checkPromo({ ...pct, expires: "2020-01-01" }, 500)).toMatchObject({ ok: false, message: expect.stringContaining("expired") });
  });
  it("never discounts below zero", () => {
    expect(checkPromo({ code: "BIG", type: "fixed", value: 500, minSubtotal: 0 }, 40)).toEqual({ ok: true, discount: 40 });
  });
  it("matches codes case-insensitively", () => {
    expect(findPromo([pct], "  ten ")).toBe(pct);
    expect(findPromo([pct], "")).toBeUndefined();
  });
});

describe("computeTotals with a discount", () => {
  it("subtracts the discount before adding shipping", () => {
    expect(computeTotals([{ unitPrice: 50, quantity: 2 }], shipping, 20)).toMatchObject({ subtotal: 100, discount: 20, shipping: 5, total: 85 });
  });
  it("cannot go negative", () => {
    expect(computeTotals([{ unitPrice: 10, quantity: 1 }], { freeOver: 0, flatRate: 0 }, 99).total).toBe(0);
  });
});
