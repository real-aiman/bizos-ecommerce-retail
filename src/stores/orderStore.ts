import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/modules/orders/types";

interface OrderState {
  orders: Order[];
  /** References whose purchase event was already sent, so a refresh never double-counts. */
  tracked: string[];
  add: (order: Order) => void;
  markTracked: (reference: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      tracked: [],
      add: (order) => set((state) => ({ orders: [order, ...state.orders.filter((o) => o.reference !== order.reference)].slice(0, 20) })),
      markTracked: (reference) => set((state) => ({ tracked: [...state.tracked, reference].slice(-50) }))
    }),
    { name: "bizos-retail-orders", skipHydration: true }
  )
);
