import type { BizosProduct } from "@/types/product";

export function isOnSale(product: BizosProduct): boolean {
  return typeof product.compareAtPrice === "number" && product.compareAtPrice > product.regularPrice && product.regularPrice > 0;
}

/** Whole-number percent saved versus the "was" price, or 0 when not on sale. */
export function savingsPercent(product: BizosProduct): number {
  return isOnSale(product) ? Math.round((1 - product.regularPrice / product.compareAtPrice!) * 100) : 0;
}

export function saleProducts(products: BizosProduct[]): BizosProduct[] {
  return products.filter(isOnSale).sort((a, b) => savingsPercent(b) - savingsPercent(a));
}
