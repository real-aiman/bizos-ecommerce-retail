import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { makeToken, passwordMatches, verifyToken, SESSION_SECONDS } from "@/lib/adminAuth";
import { catalogIssues, catalogStats, csvCell } from "@/lib/adminStats";
import { normalizeOrders } from "@/lib/adminOrders";
import { filterProducts, parseProductFilter } from "@/lib/adminProducts";
import type { BizosProduct } from "@/types/product";

const secret = createHash("sha256").update("test-secret").digest();
const p = (id: number, over: Partial<BizosProduct> = {}): BizosProduct => ({
  id, name: `Item ${id}`, slug: `item-${id}`, regularPrice: 10 * id, productImageUrl: "x", departmentId: 1, departmentName: id % 2 ? "A" : "B",
  productMeasureUnitId: 1, productMeasureUnitName: "Unit", ...over
});

describe("admin session token", () => {
  it("accepts a fresh token and rejects tampering, expiry and junk", () => {
    const now = Date.now();
    const token = makeToken(now, secret);
    expect(verifyToken(token, now, secret)).toBe(true);
    expect(verifyToken(token, now + (SESSION_SECONDS + 5) * 1000, secret)).toBe(false);
    const [exp, sig] = token.split(".");
    expect(verifyToken(`${Number(exp) + 1000}.${sig}`, now, secret)).toBe(false);
    expect(verifyToken(token, now, createHash("sha256").update("other").digest())).toBe(false);
    for (const bad of [undefined, "", "abc", "1.2.3", `${exp}.zz`]) expect(verifyToken(bad, now, secret)).toBe(false);
  });
  it("compares passwords exactly", () => {
    expect(passwordMatches("correct horse battery", "correct horse battery")).toBe(true);
    expect(passwordMatches("correct horse batter", "correct horse battery")).toBe(false);
    expect(passwordMatches("", "correct horse battery")).toBe(false);
  });
});

describe("catalog stats and issues", () => {
  it("summarises the catalog", () => {
    const s = catalogStats([p(1), p(2, { compareAtPrice: 30, inStock: false }), p(3)]);
    expect(s).toMatchObject({ total: 3, departments: 2, onSale: 1, outOfStock: 1, averagePrice: 20 });
    expect(s.priciest[0].id).toBe(3);
  });
  it("flags broken products", () => {
    const issues = catalogIssues([p(1, { regularPrice: 0 }), p(2, { productImageUrl: "" }), p(3, { slug: "dup" }), p(4, { slug: "dup" }), p(5, { compareAtPrice: 10 })]).map((i) => i.problem);
    expect(issues).toEqual(expect.arrayContaining(["Price is zero or missing", "No image", "Duplicate slug", "Was-price is not higher than the price"]));
  });
});

describe("csvCell", () => {
  it("quotes and neutralises spreadsheet formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell(undefined)).toBe("");
    expect(csvCell(12.5)).toBe("12.5");
  });
});

describe("admin filters and orders", () => {
  it("filters by text, stock and sorts", () => {
    const all = [p(1), p(2, { inStock: false }), p(3)];
    expect(filterProducts(all, parseProductFilter({ stock: "out" })).map((x) => x.id)).toEqual([2]);
    expect(filterProducts(all, parseProductFilter({ q: "item 3" })).map((x) => x.id)).toEqual([3]);
    expect(filterProducts(all, parseProductFilter({ sort: "price-desc" })).map((x) => x.id)).toEqual([3, 2, 1]);
  });
  it("normalizes common order shapes and ignores junk", () => {
    const rows = normalizeOrders({ data: [{ orderNumber: 7, createdAt: "2026-01-01", customer: { fullName: "Sam" }, total: "12.5", status: "paid" }, null, "x"] });
    expect(rows).toEqual([{ reference: "7", date: "2026-01-01", customer: "Sam", total: 12.5, status: "paid" }]);
    expect(normalizeOrders("nope")).toEqual([]);
  });
});
