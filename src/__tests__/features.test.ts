import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { isOnSale, saleProducts, savingsPercent } from "@/lib/deals";
import { useCompareStore } from "@/stores/compareStore";
import { useRecentStore } from "@/stores/recentStore";
import { useProfileStore } from "@/stores/profileStore";
import type { BizosProduct } from "@/types/product";

const p = (id: number, price: number, was?: number): BizosProduct => ({
  id, name: `P${id}`, slug: `p${id}`, regularPrice: price, compareAtPrice: was, productImageUrl: "x",
  departmentId: 1, departmentName: "D", productMeasureUnitId: 1, productMeasureUnitName: "Unit"
});

describe("deals", () => {
  it("only treats a higher was-price as a sale and sorts by savings", () => {
    expect(isOnSale(p(1, 100))).toBe(false);
    expect(isOnSale(p(1, 100, 100))).toBe(false);
    expect(savingsPercent(p(1, 75, 100))).toBe(25);
    expect(saleProducts([p(1, 90, 100), p(2, 50, 100), p(3, 10)]).map((x) => x.id)).toEqual([2, 1]);
  });
});

describe("compareStore", () => {
  beforeEach(() => act(() => useCompareStore.getState().clear()));
  it("caps at three and reports when full", () => {
    act(() => { [1, 2, 3].forEach((i) => useCompareStore.getState().toggle(i)); });
    let ok = true;
    act(() => { ok = useCompareStore.getState().toggle(4); });
    expect(ok).toBe(false);
    expect(useCompareStore.getState().ids).toEqual([1, 2, 3]);
    act(() => { useCompareStore.getState().toggle(2); });
    expect(useCompareStore.getState().ids).toEqual([1, 3]);
  });
});

describe("recentStore", () => {
  beforeEach(() => act(() => useRecentStore.getState().clear()));
  it("keeps most recent first without duplicates, max 8", () => {
    act(() => { for (let i = 1; i <= 10; i++) useRecentStore.getState().view(i); useRecentStore.getState().view(5); });
    const { ids } = useRecentStore.getState();
    expect(ids[0]).toBe(5);
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
  });
});

describe("profileStore address book", () => {
  beforeEach(() => act(() => useProfileStore.getState().clear()));
  const a = { fullName: "A", email: "a@b.co", phone: "+92 300 111", address: "House 1", city: "Lahore", postalCode: "" };
  it("de-duplicates the same address and caps at five", () => {
    act(() => { useProfileStore.getState().save(a); useProfileStore.getState().save({ ...a, fullName: "A2" }); });
    expect(useProfileStore.getState().addresses).toHaveLength(1);
    expect(useProfileStore.getState().addresses[0].fullName).toBe("A2");
    act(() => { for (let i = 0; i < 7; i++) useProfileStore.getState().save({ ...a, address: `Street ${i}` }); });
    expect(useProfileStore.getState().addresses).toHaveLength(5);
  });
});
