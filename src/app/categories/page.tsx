import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/modules/products/services/productService";
import { departmentCounts } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Categories", description: "Browse every department.", alternates: { canonical: "/categories" } };

export default async function CategoriesPage() {
  const all = await getAllProducts();
  const departments = departmentCounts(all);
  return (
    <main id="main" className="container page">
      <h1 className="page-title">Categories</h1>
      {departments.length === 0 ? (
        <div className="empty-state"><h2>No categories yet</h2><Link href="/" className="btn btn-dark">Back to shop</Link></div>
      ) : (
        <div className="category-grid">
          {departments.map((d) => {
            const items = all.filter((p) => p.departmentName === d.name);
            const from = Math.min(...items.map((p) => p.regularPrice));
            return (
              <Link key={d.name} href={`/?department=${encodeURIComponent(d.name)}#catalog`} className="category-card">
                <span className="category-images" aria-hidden="true">
                  {items.slice(0, 3).map((p) => <span key={p.id}><Image src={p.productImageUrl} alt="" fill sizes="96px" /></span>)}
                </span>
                <strong>{d.name}</strong>
                <small>{d.count} {d.count === 1 ? "product" : "products"} · from {formatCurrency(from)}</small>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
