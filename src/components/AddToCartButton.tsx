"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";
import { useUiStore } from "@/stores/uiStore";
import type { BizosProduct } from "@/types/product";
import { productToAnalyticsItem, trackAddToCart } from "@/lib/analytics";

export function AddToCartButton({ product, quantity = 1, className = "btn btn-gold" }: { product: BizosProduct; quantity?: number; className?: string }) {
  const add = useCartStore((state) => state.add);
  const push = useToastStore((state) => state.push);
  const openCart = useUiStore((state) => state.openCart);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        add(product, quantity);
        trackAddToCart(productToAnalyticsItem(product, quantity));
        push(`${product.name} added to cart`, { label: "View cart", run: openCart });
        setAdded(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setAdded(false), 1200);
      }}
      aria-label={`Add ${product.name} to cart`}
    >
      {added ? <Check size={17} /> : <ShoppingBag size={17} />}
      <span aria-live="polite">{added ? "Added" : "Add to cart"}</span>
    </button>
  );
}
