import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllProducts } from "@/modules/products/services/productService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  const products = await getAllProducts().catch(() => []);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...["categories", "deals", "about", "faq", "contact"].map((p) => ({ url: `${base}/${p}`, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, changeFrequency: "daily" as const, priority: 0.8 }))
  ];
}
