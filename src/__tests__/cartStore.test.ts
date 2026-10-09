import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/stores/cartStore";
import type { BizosProduct } from "@/types/product";

const product: BizosProduct = {
  id: 101, name: "Test Product", slug: "test-product", regularPrice: 100,
  productImageUrl: "https://example.com/product.jpg", departmentId: 1, departmentName: "Electronics",
  productMeasureUnitId: 1, productMeasureUnitName: "piece"
};

describe("cartStore", () => {
  beforeEach(() => act(() => useCartStore.getState().clear()));

  it("adds a product and increments an existing product", () => {
    act(() => { useCartStore.getState().add(product); useCartStore.getState().add(product); });
    expect(useCartStore.getState().items).toEqual([{ product, quantity: 2 }]);
  });

  it("adds a chosen quantity", () => {
    act(() => useCartStore.getState().add(product, 3));
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("removes an item when quantity reaches zero", () => {
    act(() => { useCartStore.getState().add(product); useCartStore.getState().setQuantity(product.id, 0); });
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("caps quantity at 99", () => {
    act(() => { useCartStore.getState().add(product, 98); useCartStore.getState().add(product, 50); });
    expect(useCartStore.getState().items[0].quantity).toBe(99);
  });

  it("syncs prices from the server", () => {
    act(() => { useCartStore.getState().add(product); useCartStore.getState().syncPrices({ 101: 120 }); });
    expect(useCartStore.getState().items[0].product.regularPrice).toBe(120);
  });

  it("keeps a promo until the cart is cleared", () => {
    const promo = { code: "SAVE10", type: "percent" as const, value: 10, minSubtotal: 0 };
    act(() => { useCartStore.getState().add(product); useCartStore.getState().setPromo(promo); });
    expect(useCartStore.getState().promo).toEqual(promo);
    act(() => useCartStore.getState().clear());
    expect(useCartStore.getState().promo).toBeNull();
  });
});
