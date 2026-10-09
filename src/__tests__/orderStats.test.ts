import { describe, expect, it } from "vitest";
import { orderStats, searchOrders } from "@/lib/orderStats";
import type { Order } from "@/modules/orders/types";

const o = (reference: string, createdAt: string, total: number, name = "Laptop", over: Partial<Order> = {}): Order => ({
  reference, createdAt, total, subtotal: total, shipping: 0, paymentMethod: "cod", persisted: true,
  customer: { fullName: "A B", email: "a@b.co", phone: "+92 300 1234567", address: "1 St", city: "Lahore", postalCode: "", notes: "" },
  lines: [{ id: 1, slug: "x", name, image: "x", unitPrice: total, quantity: 2 }], ...over
});

describe("orderStats", () => {
  it("sums spend, items and promo savings, tolerating orders without a discount", () => {
    const stats = orderStats([o("A", "2026-01-02", 100, "Laptop", { discount: 10 }), o("B", "2026-01-03", 50)]);
    expect(stats).toEqual({ count: 2, spent: 150, saved: 10, items: 4, average: 75 });
    expect(orderStats([])).toEqual({ count: 0, spent: 0, saved: 0, items: 0, average: 0 });
  });
});

describe("searchOrders", () => {
  const list = [o("A1", "2026-01-01", 10, "Phone"), o("B2", "2026-03-01", 300, "Scooter"), o("C3", "2026-02-01", 50, "Laptop", { promoCode: "SAVE10" })];
  it("matches reference, product and promo, case-insensitively", () => {
    expect(searchOrders(list, "scoo").map((x) => x.reference)).toEqual(["B2"]);
    expect(searchOrders(list, "c3").map((x) => x.reference)).toEqual(["C3"]);
    expect(searchOrders(list, "save10").map((x) => x.reference)).toEqual(["C3"]);
  });
  it("sorts and never mutates the input", () => {
    const copy = [...list];
    expect(searchOrders(list, "").map((x) => x.reference)).toEqual(["B2", "C3", "A1"]);
    expect(searchOrders(list, "", "oldest").map((x) => x.reference)).toEqual(["A1", "C3", "B2"]);
    expect(searchOrders(list, "", "highest").map((x) => x.reference)).toEqual(["B2", "C3", "A1"]);
    expect(list).toEqual(copy);
  });
});
