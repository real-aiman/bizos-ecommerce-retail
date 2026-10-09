import { create } from "zustand";
import { persist } from "zustand/middleware";
import { store } from "@/config/store";
import type { Promo } from "@/lib/promo";
import type { BizosProduct } from "@/types/product";

export interface CartItem {
  product: BizosProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Terms of the applied promo, for display. The server re-validates it when the order is placed. */
  promo: Promo | null;
  setPromo: (promo: Promo | null) => void;
  add: (product: BizosProduct, quantity?: number) => void;
  remove: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  /** Refresh stored prices after the server reports they changed. */
  syncPrices: (prices: Record<number, number>) => void;
  clear: () => void;
}

const MAX = store.limits.maxQuantity;
const clampQty = (value: number) => Math.min(MAX, Math.max(0, Math.floor(value)));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promo: null,
      setPromo: (promo) => set({ promo }),
      add: (product, quantity = 1) =>
        set((state) => {
          const qty = clampQty(quantity);
          if (qty < 1) return state;
          const existing = state.items.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: clampQty(item.quantity + qty) } : item
              )
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.product.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => {
          const qty = clampQty(quantity);
          return {
            items:
              qty <= 0
                ? state.items.filter((item) => item.product.id !== id)
                : state.items.map((item) => (item.product.id === id ? { ...item, quantity: qty } : item))
          };
        }),
      syncPrices: (prices) =>
        set((state) => ({
          items: state.items.map((item) =>
            prices[item.product.id] === undefined
              ? item
              : { ...item, product: { ...item.product, regularPrice: prices[item.product.id] } }
          )
        })),
      clear: () => set({ items: [], promo: null })
    }),
    { name: "bizos-retail-cart", skipHydration: true }
  )
);

export const selectCount = (state: CartState) => state.items.reduce((sum, item) => sum + item.quantity, 0);
