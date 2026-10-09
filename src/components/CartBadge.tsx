"use client";

import { ShoppingBag } from "lucide-react";
import { selectCount, useCartStore } from "@/stores/cartStore";
import { useUiStore } from "@/stores/uiStore";

export function CartBadge() {
  const count = useCartStore(selectCount);
  const open = useUiStore((s) => s.cartOpen);
  const openCart = useUiStore((s) => s.openCart);
  return (
    <button type="button" className="icon-link" aria-haspopup="dialog" aria-expanded={open} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} onClick={openCart}>
      <ShoppingBag size={20} />
      {count > 0 && <span className="badge">{count}</span>}
    </button>
  );
}
