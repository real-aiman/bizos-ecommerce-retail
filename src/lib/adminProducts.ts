import type { BizosProduct } from "@/types/product";
import { isOnSale } from "@/lib/deals";

export interface ProductFilter { q: string; department: string; stock: "" | "in" | "out"; sale: boolean; sort: "name" | "price-asc" | "price-desc" }

export function parseProductFilter(sp: Record<string, string | string[] | undefined>): ProductFilter {
  const one = (k: string) => { const v = sp[k]; return (Array.isArray(v) ? v[0] : v) ?? ""; };
  const sort = one("sort");
  const stock = one("stock");
  return {
    q: one("q").trim().slice(0, 80),
    department: one("department").slice(0, 80),
    stock: stock === "in" || stock === "out" ? stock : "",
    sale: one("sale") === "1",
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "name"
  };
}

export function filterProducts(all: BizosProduct[], f: ProductFilter): BizosProduct[] {
  const q = f.q.toLowerCase();
  const rows = all.filter((p) =>
    (!q || p.name.toLowerCase().includes(q) || String(p.id) === q || (p.brand ?? "").toLowerCase().includes(q)) &&
    (!f.department || p.departmentName === f.department) &&
    (f.stock === "" || (f.stock === "out" ? p.inStock === false : p.inStock !== false)) &&
    (!f.sale || isOnSale(p))
  );
  return rows.sort((a, b) => (f.sort === "price-asc" ? a.regularPrice - b.regularPrice : f.sort === "price-desc" ? b.regularPrice - a.regularPrice : a.name.localeCompare(b.name)));
}

export const filterQuery = (f: ProductFilter, extra: Record<string, string> = {}) => {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.department) p.set("department", f.department);
  if (f.stock) p.set("stock", f.stock);
  if (f.sale) p.set("sale", "1");
  if (f.sort !== "name") p.set("sort", f.sort);
  for (const [k, v] of Object.entries(extra)) p.set(k, v);
  return p.toString();
};
