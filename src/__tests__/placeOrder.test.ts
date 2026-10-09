import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/error-handling", () => ({ reportError: vi.fn() }));
vi.mock("@/modules/products/services/productService", () => ({
  getAllProducts: vi.fn(async () => [
    { id: 1, name: "Laptop", slug: "laptop", regularPrice: 1000, productImageUrl: "x", departmentId: 1, departmentName: "E", productMeasureUnitId: 1, productMeasureUnitName: "Unit" }
  ])
}));

const customer = { fullName: "Aiman Shafiq", email: "a@b.co", phone: "+92 300 1234567", address: "House 1", city: "Lahore" };
const input = (over: Record<string, unknown> = {}) => ({ customer, lines: [{ id: 1, quantity: 2 }], paymentMethod: "cod" as const, expectedTotal: 2000, ...over });

async function load(env: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("@/lib/env", () => ({ env: { bizosApiUrl: "", bizosOrdersPath: "", bizosApiKey: "", allowSimulatedOrders: false, promoCodes: "", ...env } }));
  return (await import("@/modules/orders/actions/placeOrder")).placeOrder;
}

describe("placeOrder", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("re-prices on the server and accepts simulated orders only when opted in", async () => {
    const placeOrder = await load({ allowSimulatedOrders: true });
    const r = await placeOrder(input());
    expect(r.ok && r.order).toMatchObject({ total: 2000, persisted: false });
  });

  it("refuses to fake an order in production without an orders endpoint", async () => {
    const placeOrder = await load({});
    const r = await placeOrder(input());
    expect(r).toMatchObject({ ok: false, code: "ORDERS_UNAVAILABLE" });
  });

  it("rejects a tampered client total and returns authoritative prices", async () => {
    const placeOrder = await load({ allowSimulatedOrders: true });
    const r = await placeOrder(input({ expectedTotal: 10 }));
    expect(r).toMatchObject({ ok: false, code: "PRICE_CHANGED", prices: { 1: 1000 } });
  });

  it("rejects unknown products and invalid details", async () => {
    const placeOrder = await load({ allowSimulatedOrders: true });
    expect(await placeOrder(input({ lines: [{ id: 99, quantity: 1 }] }))).toMatchObject({ ok: false, code: "UNAVAILABLE" });
    expect(await placeOrder(input({ customer: { ...customer, email: "x" } }))).toMatchObject({ ok: false, code: "INVALID" });
  });

  it("POSTs to the backend with an idempotency key when configured", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ orderNumber: "SO-77" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const placeOrder = await load({ bizosApiUrl: "https://api.test", bizosOrdersPath: "/orders", bizosApiKey: "k" });
    const r = await placeOrder(input());
    expect(r.ok && r.order).toMatchObject({ reference: "SO-77", persisted: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/orders");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toMatch(/^BZ-/);
    vi.unstubAllGlobals();
  });

  const promos = JSON.stringify([{ code: "SAVE10", type: "percent", value: 10, minSubtotal: 500 }]);

  it("applies a valid promo on the server and records the discount", async () => {
    const placeOrder = await load({ allowSimulatedOrders: true, promoCodes: promos });
    const r = await placeOrder(input({ promoCode: "save10", expectedTotal: 1800 }));
    expect(r.ok && r.order).toMatchObject({ subtotal: 2000, discount: 200, total: 1800, promoCode: "SAVE10" });
  });

  it("rejects unknown promo codes instead of ignoring them", async () => {
    const placeOrder = await load({ allowSimulatedOrders: true, promoCodes: promos });
    expect(await placeOrder(input({ promoCode: "FAKE", expectedTotal: 1800 }))).toMatchObject({ ok: false, code: "PROMO_INVALID" });
  });

  it("does not let a client claim a discount without a code", async () => {
    const placeOrder = await load({ allowSimulatedOrders: true, promoCodes: promos });
    expect(await placeOrder(input({ expectedTotal: 1800 }))).toMatchObject({ ok: false, code: "PRICE_CHANGED" });
  });
});
