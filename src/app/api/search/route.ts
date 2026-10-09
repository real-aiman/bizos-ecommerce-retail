import { NextResponse } from "next/server";
import { applyCatalogQuery, parseCatalogQuery } from "@/lib/catalog";
import { getAllProducts } from "@/modules/products/services/productService";

/** Lightweight typeahead for the header search box. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const query = parseCatalogQuery({ q });
  if (query.q.length < 2) return NextResponse.json({ results: [] });
  try {
    const rows = applyCatalogQuery(await getAllProducts(), query).slice(0, 6);
    return NextResponse.json(
      { results: rows.map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.regularPrice, image: p.productImageUrl, department: p.departmentName })) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ results: [] });
  }
}
