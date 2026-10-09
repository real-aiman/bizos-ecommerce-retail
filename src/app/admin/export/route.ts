import { NextResponse } from "next/server";
import { adminEnabled, isAdmin } from "@/lib/adminAuth";
import { csvCell } from "@/lib/adminStats";
import { filterProducts, parseProductFilter } from "@/lib/adminProducts";
import { getAllProducts } from "@/modules/products/services/productService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!adminEnabled()) return new NextResponse("Not found", { status: 404 });
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const rows = filterProducts(await getAllProducts(), parseProductFilter(sp));
  const head = ["id", "name", "slug", "department", "price", "compare_at_price", "in_stock"];
  const lines = rows.map((p) => [p.id, p.name, p.slug, p.departmentName, p.regularPrice, p.compareAtPrice, p.inStock === undefined ? "" : p.inStock].map(csvCell).join(","));
  return new NextResponse([head.join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="products.csv"', "Cache-Control": "no-store" }
  });
}
