"use client";

import Link from "next/link";
import type { BizosProduct } from "@/types/product";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";
import { useUiStore } from "@/stores/uiStore";
import { ProductCard } from "./ProductCard";

export function WishlistGrid({ products }: { products: BizosProduct[] }) {
  const ids = useWishlistStore((s) => s.ids);
  const hydrated = useHydrated();
  const add = useCartStore((s) => s.add);
  const push = useToastStore((s) => s.push);
  const openCart = useUiStore((s) => s.openCart);
  if (!hydrated) return <div className="skeleton-grid" aria-busy="true">{[0, 1, 2, 3].map((i) => <div className="skeleton" key={i} />)}</div>;
  const saved = products.filter((p) => ids.includes(p.id));
  if (!saved.length) {
    return (
      <div className="empty-state">
        <h2>Nothing saved yet</h2>
        <p>Tap the heart on any product to keep it here.</p>
        <Link href="/#catalog" className="btn btn-dark">Browse products</Link>
      </div>
    );
  }
  const buyable = saved.filter((p) => p.inStock !== false);
  return (
    <>
      <div className="section-row">
        <p className="muted">{saved.length} saved {saved.length === 1 ? "product" : "products"}</p>
        <button type="button" className="btn btn-dark btn-sm" disabled={!buyable.length} onClick={() => { buyable.forEach((p) => add(p, 1)); push(`${buyable.length} added to your cart`, { label: "View cart", run: openCart }); }}>Add all to cart</button>
      </div>
      <div className="product-grid">{saved.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </>
  );
}
