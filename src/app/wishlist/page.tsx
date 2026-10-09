import type { Metadata } from "next";
import { getAllProducts } from "@/modules/products/services/productService";
import { WishlistGrid } from "@/components/WishlistGrid";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const products = await getAllProducts();
  return (
    <main id="main" className="container page">
      <h1 className="page-title">Wishlist</h1>
      <WishlistGrid products={products} />
    </main>
  );
}
