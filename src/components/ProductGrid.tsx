import Link from "next/link";
import type { BizosProduct } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, eager = 4 }: { products: BizosProduct[]; eager?: number }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <h2>No products match</h2>
        <p>Try a different search, widen the price range or clear your filters.</p>
        <Link href="/#catalog" className="btn btn-dark">Clear filters</Link>
      </div>
    );
  }
  return (
    <div className="product-grid">
      {products.map((product, i) => <ProductCard key={product.id} product={product} priority={i < eager} />)}
    </div>
  );
}
