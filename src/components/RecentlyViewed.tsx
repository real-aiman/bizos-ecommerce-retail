"use client";

import { useEffect, useState } from "react";
import { useRecentStore } from "@/stores/recentStore";
import { useHydrated } from "@/hooks/useHydrated";
import type { BizosProduct } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const ids = useRecentStore((s) => s.ids);
  const clear = useRecentStore((s) => s.clear);
  const hydrated = useHydrated();
  const [products, setProducts] = useState<BizosProduct[]>([]);
  const wanted = ids.filter((id) => id !== excludeId).slice(0, 4).join(",");

  useEffect(() => {
    if (!hydrated || !wanted) { setProducts([]); return; }
    let live = true;
    fetch(`/api/products?ids=${wanted}`).then((r) => r.json()).then((d: { products: BizosProduct[] }) => { if (live) setProducts(d.products); }).catch(() => {});
    return () => { live = false; };
  }, [hydrated, wanted]);

  if (!products.length) return null;
  return (
    <section className="related" aria-labelledby="recent-h">
      <div className="section-row"><h2 id="recent-h">Recently viewed</h2><button type="button" className="link-danger" onClick={clear}>Clear</button></div>
      <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </section>
  );
}
