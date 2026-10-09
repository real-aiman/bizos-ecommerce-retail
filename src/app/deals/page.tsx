import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { parsePromos } from "@/lib/promo";
import { saleProducts } from "@/lib/deals";
import { formatCurrency } from "@/lib/utils";
import { getAllProducts } from "@/modules/products/services/productService";
import { ProductGrid } from "@/components/ProductGrid";
import { DealCountdown } from "@/components/DealCountdown";

export const metadata: Metadata = { title: "Deals", description: "Discounted products and active promo codes.", alternates: { canonical: "/deals" } };

export default async function DealsPage() {
  const products = saleProducts(await getAllProducts());
  const today = new Date().toISOString().slice(0, 10);
  const promos = parsePromos(env.promoCodes).filter((p) => p.public && (!p.expires || p.expires >= today));

  return (
    <main id="main" className="container page">
      <h1 className="page-title">Deals</h1>
      {promos.length > 0 && (
        <section aria-labelledby="codes-h" className="deal-codes">
          <h2 id="codes-h">Promo codes</h2>
          <ul>
            {promos.map((p) => (
              <li key={p.code} className="deal-code">
                <span>
                  <strong>{p.code}</strong>
                  <small>{p.type === "percent" ? `${p.value}% off` : `${formatCurrency(p.value)} off`}{p.minSubtotal ? ` orders over ${formatCurrency(p.minSubtotal)}` : ""}{p.maxDiscount ? `, up to ${formatCurrency(p.maxDiscount)}` : ""}</small>
                </span>
                {p.expires && <DealCountdown until={p.expires} />}
              </li>
            ))}
          </ul>
          <p className="muted">Enter the code in your cart or at checkout.</p>
        </section>
      )}
      {products.length > 0 ? (
        <section aria-labelledby="sale-h">
          <h2 id="sale-h" className="section-h">Reduced prices</h2>
          <ProductGrid products={products} />
        </section>
      ) : promos.length === 0 && (
        <div className="empty-state"><h2>No deals right now</h2><p>Check back soon, or browse the full catalog.</p><Link href="/#catalog" className="btn btn-dark">Shop all</Link></div>
      )}
    </main>
  );
}
