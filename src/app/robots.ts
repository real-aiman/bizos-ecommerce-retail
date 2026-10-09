import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/account", "/dashboard", "/wishlist", "/api", "/admin"] }, sitemap: `${base}/sitemap.xml` };
}
