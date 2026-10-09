import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderDetail } from "@/components/dashboard/OrderDetail";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { persistedStores } from "@/hooks/useHydrated";
import { useOrderStore } from "@/stores/orderStore";
import type { Order } from "@/modules/orders/types";

vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

const order: Order = {
  reference: "BZ-1001", createdAt: "2026-05-01T10:00:00.000Z", subtotal: 200, discount: 20, promoCode: "SAVE10", shipping: 5, total: 185,
  paymentMethod: "cod", persisted: true,
  customer: { fullName: "Sana Khan", email: "sana@example.com", phone: "+92 300 1234567", address: "House 4, Gulberg", city: "Lahore", postalCode: "54000", notes: "Ring twice" },
  lines: [{ id: 7, slug: "laptop", name: "Laptop Pro", image: "https://x/y.png", unitPrice: 100, quantity: 2 }]
};

beforeEach(async () => {
  await act(async () => {
    await Promise.all(persistedStores.map((s) => s.persist.rehydrate()));
    useOrderStore.setState({ orders: [order], tracked: [] });
  });
});

describe("OrderDetail", () => {
  it("shows items, totals, promo, address and notes", async () => {
    render(<OrderDetail reference="BZ-1001" />);
    expect(await screen.findByRole("heading", { name: "Order BZ-1001" })).toBeTruthy();
    expect(screen.getByText("Laptop Pro")).toBeTruthy();
    expect(screen.getByText("Promo SAVE10")).toBeTruthy();
    expect(screen.getByText(/House 4, Gulberg/)).toBeTruthy();
    expect(screen.getByText(/Ring twice/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Order again/ })).toBeTruthy();
  });
  it("handles an unknown reference without crashing", async () => {
    render(<OrderDetail reference="nope" />);
    expect(await screen.findByText("Order not found on this device")).toBeTruthy();
  });
});

describe("OrdersList", () => {
  it("lists orders and the empty state", async () => {
    const { unmount } = render(<OrdersList />);
    expect(await screen.findByText("BZ-1001")).toBeTruthy();
    unmount();
    act(() => { useOrderStore.setState({ orders: [] }); });
    render(<OrdersList />);
    expect(await screen.findByText("No orders yet")).toBeTruthy();
  });
});
