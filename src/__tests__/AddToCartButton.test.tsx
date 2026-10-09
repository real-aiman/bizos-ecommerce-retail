import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useCartStore } from "@/stores/cartStore";
import type { BizosProduct } from "@/types/product";

const product: BizosProduct = {
  id: 202,
  name: "Test Headphones",
  slug: "test-headphones",
  regularPrice: 49.99,
  productImageUrl: "https://example.com/headphones.jpg",
  departmentId: 2,
  departmentName: "Audio",
  productMeasureUnitId: 1,
  productMeasureUnitName: "piece"
};

describe("AddToCartButton", () => {
  beforeEach(() => {
    act(() => useCartStore.getState().clear());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds the product and gives accessible feedback", () => {
    vi.useFakeTimers();
    render(<AddToCartButton product={product} />);

    const button = screen.getByRole("button", { name: "Add Test Headphones to cart" });
    fireEvent.click(button);

    expect(useCartStore.getState().items[0]).toEqual({ product, quantity: 1 });
    expect(screen.getByRole("button", { name: "Add Test Headphones to cart" })).toHaveTextContent("Added");

    act(() => vi.advanceTimersByTime(1200));
    expect(screen.getByRole("button", { name: "Add Test Headphones to cart" })).toHaveTextContent("Add to cart");
  });
});
