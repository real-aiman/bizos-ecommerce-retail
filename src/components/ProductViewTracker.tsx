"use client";

import { useEffect } from "react";
import { productToAnalyticsItem, trackViewItem } from "@/lib/analytics";
import { useRecentStore } from "@/stores/recentStore";
import type { BizosProduct } from "@/types/product";

export function ProductViewTracker({ product }: { product: BizosProduct }) {
  const view = useRecentStore((s) => s.view);
  useEffect(() => {
    trackViewItem(productToAnalyticsItem(product));
    view(product.id);
  }, [product, view]);

  return null;
}
