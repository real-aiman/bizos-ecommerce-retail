import { NextResponse } from "next/server";
import { getAllProducts } from "@/modules/products/services/productService";

/** Full product records for a short list of ids (recently viewed, reorder). */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 20);
  if (!ids.length) return NextResponse.json({ products: [] });
  try {
    const all = await getAllProducts();
    const products = ids.flatMap((id) => all.find((p) => p.id === id) ?? []);
    return NextResponse.json({ products }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
