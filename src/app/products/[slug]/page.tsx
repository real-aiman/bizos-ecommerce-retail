import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/config/store";
import { env } from "@/lib/env";
import { getProductBySlug, getRelatedProducts, getAllProducts } from "@/modules/products/services/productService";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { ProductGrid } from "@/components/ProductGrid";
import { JsonLd } from "@/components/JsonLd";
import { formatCurrency } from "@/lib/utils";
import { unitLabel } from "@/lib/catalog";
import { isOnSale, savingsPercent } from "@/lib/deals";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ShareButton } from "@/components/ShareButton";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  const description = product.description || `${product.name} — ${formatCurrency(product.regularPrice)}. ${product.departmentName} at ${store.name}.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description, images: [{ url: product.productImageUrl }], type: "website" },
    twitter: { card: "summary_large_image", title: product.name, images: [product.productImageUrl] }
  };
}

export async function generateStaticParams() {
  try {
    return (await getAllProducts()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Params) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const unit = unitLabel(product);
  const site = env.siteUrl.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        image: product.images?.length ? product.images : [product.productImageUrl],
        category: product.departmentName,
        ...(product.description ? { description: product.description } : {}),
        ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
        offers: {
          "@type": "Offer",
          url: `${site}/products/${product.slug}`,
          price: product.regularPrice,
          priceCurrency: store.currency,
          ...(product.inStock === undefined ? {} : { availability: `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}` })
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Shop", item: site },
          { "@type": "ListItem", position: 2, name: product.departmentName, item: `${site}/?department=${encodeURIComponent(product.departmentName)}` },
          { "@type": "ListItem", position: 3, name: product.name }
        ]
      }
    ]
  };

  const facts: [string, string][] = [
    ["Department", product.departmentName],
    ...(product.brand ? ([["Brand", product.brand]] as [string, string][]) : []),
    ["Sold per", product.productMeasureUnitName]
  ];

  return (
    <main id="main" className="container page">
      <JsonLd data={jsonLd} />
      <ProductViewTracker product={product} />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/?department=${encodeURIComponent(product.departmentName)}#catalog`}>{product.departmentName}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail">
        <div className="detail-image">
          <Image src={product.productImageUrl} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 56vw" />
        </div>
        <div className="detail-info">
          <span className="chip">{product.departmentName}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatCurrency(product.regularPrice)}{unit && <small> / {unit}</small>}{isOnSale(product) && <><s className="was">{formatCurrency(product.compareAtPrice!)}</s><span className="save-badge">Save {savingsPercent(product)}%</span></>}</p>
          {product.description && <p className="detail-copy">{product.description}</p>}
          {product.inStock === false ? <p className="banner">Currently out of stock.</p> : <ProductBuyBox product={product} />}
          <ShareButton title={product.name} />
          <ul className="assurance">
            {store.payments.cashOnDelivery && <li>Pay with cash on delivery</li>}
            {store.shipping.freeOver > 0 && <li>Free delivery over {formatCurrency(store.shipping.freeOver)}</li>}
            {store.policies.returns && <li>{store.policies.returns}</li>}
          </ul>
          <dl className="facts">
            {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related" aria-labelledby="related-h">
          <h2 id="related-h">More in {product.departmentName}</h2>
          <ProductGrid products={related} eager={0} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </main>
  );
}
