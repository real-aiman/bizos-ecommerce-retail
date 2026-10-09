import { describe, expect, it } from "vitest";
import { applyCatalogQuery, catalogHref, departmentCounts, parseCatalogQuery, unitLabel } from "@/lib/catalog";
import type { BizosProduct } from "@/types/product";

const make = (id: number, name: string, price: number, dept: string, unit = "Unit"): BizosProduct => ({
  id, name, slug: name.toLowerCase().replace(/\s/g, "-"), regularPrice: price, productImageUrl: "x", departmentId: 1,
  departmentName: dept, productMeasureUnitId: 1, productMeasureUnitName: unit
});
const products = [make(1, "MacBook Air", 1099, "Electronics"), make(2, "iPhone 17", 799, "Electronics"), make(3, "OKG Bike", 1000, "Mobility", "Piece")];

describe("catalog", () => {
  it("parses and sanitises params", () => {
    const q = parseCatalogQuery({ q: "  mac ", sort: "bogus", min: "abc", max: "900", page: "-4" });
    expect(q).toMatchObject({ q: "mac", sort: "featured", min: undefined, max: 900, page: 1 });
  });
  it("filters by tokens, department and price", () => {
    expect(applyCatalogQuery(products, parseCatalogQuery({ q: "air mac" })).map((p) => p.id)).toEqual([1]);
    expect(applyCatalogQuery(products, parseCatalogQuery({ department: "Mobility" })).map((p) => p.id)).toEqual([3]);
    expect(applyCatalogQuery(products, parseCatalogQuery({ min: "800", max: "1050" })).map((p) => p.id)).toEqual([3]);
  });
  it("sorts", () => {
    expect(applyCatalogQuery(products, parseCatalogQuery({ sort: "price-asc" })).map((p) => p.id)).toEqual([2, 3, 1]);
    expect(applyCatalogQuery(products, parseCatalogQuery({ sort: "price-desc" })).map((p) => p.id)).toEqual([1, 3, 2]);
    expect(applyCatalogQuery(products, parseCatalogQuery({ sort: "name" })).map((p) => p.id)).toEqual([2, 1, 3]);
  });
  it("builds hrefs and counts departments", () => {
    expect(catalogHref({}, {})).toBe("/");
    expect(catalogHref({ q: "a b", sort: "name" }, { page: 2 })).toBe("/?q=a+b&sort=name&page=2");
    expect(departmentCounts(products)).toEqual([{ name: "Electronics", count: 2 }, { name: "Mobility", count: 1 }]);
  });
  it("hides the generic 'Unit' label", () => {
    expect(unitLabel(products[0])).toBeNull();
    expect(unitLabel(products[2])).toBe("piece");
  });
});
