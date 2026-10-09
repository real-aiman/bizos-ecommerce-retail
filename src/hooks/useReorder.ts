"use client";

import { useCallback } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";
import { useUiStore } from "@/stores/uiStore";
import type { Order } from "@/modules/orders/types";
import type { BizosProduct } from "@/types/product";

/** Puts a past order's items back in the cart at today's prices. Items no longer sold are skipped. */
export function useReorder() {
  const add = useCartStore((s) => s.add);
  const push = useToastStore((s) => s.push);
  const openCart = useUiStore((s) => s.openCart);

  return useCallback(async (order: Order) => {
    try {
      const res = await fetch(`/api/products?ids=${order.lines.map((l) => l.id).join(",")}`);
      const { products } = (await res.json()) as { products: BizosProduct[] };
      let added = 0;
      for (const line of order.lines) {
        const product = products.find((p) => p.id === line.id);
        if (product) { add(product, line.quantity); added++; }
      }
      const skipped = order.lines.length - added;
      if (!added) return push("Those items are no longer available.");
      push(skipped ? `${added} added, ${skipped} no longer sold` : "Items added to your cart", { label: "View cart", run: openCart });
    } catch {
      push("Could not reach the store. Try again.");
    }
  }, [add, push, openCart]);
}
