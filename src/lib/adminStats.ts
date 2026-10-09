import type { BizosProduct } from "@/types/product";
import { isOnSale } from "@/lib/deals";

export interface CatalogStats {
  total: number;
  departments: number;
  onSale: number;
  outOfStock: number;
  averagePrice: number;
  byDepartment: { name: string; count: number; averagePrice: number }[];
  priciest: BizosProduct[];
}

export function catalogStats(products: BizosProduct[]): CatalogStats {
  const groups = new Map<string, BizosProduct[]>();
  for (const p of products) groups.set(p.departmentName, [...(groups.get(p.departmentName) ?? []), p]);
  const sum = (list: BizosProduct[]) => list.reduce((acc, p) => acc + p.regularPrice, 0);
  return {
    total: products.length,
    departments: groups.size,
    onSale: products.filter(isOnSale).length,
    outOfStock: products.filter((p) => p.inStock === false).length,
    averagePrice: products.length ? Math.round((sum(products) / products.length) * 100) / 100 : 0,
    byDepartment: [...groups].map(([name, list]) => ({ name, count: list.length, averagePrice: Math.round((sum(list) / list.length) * 100) / 100 })).sort((a, b) => b.count - a.count),
    priciest: [...products].sort((a, b) => b.regularPrice - a.regularPrice).slice(0, 5)
  };
}

export interface CatalogIssue { id: number; name: string; problem: string }

/** Things that make a product look broken or sell wrongly on the storefront. */
export function catalogIssues(products: BizosProduct[]): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const slugs = new Map<string, number>();
  for (const p of products) slugs.set(p.slug, (slugs.get(p.slug) ?? 0) + 1);
  for (const p of products) {
    if (!(p.regularPrice > 0)) issues.push({ id: p.id, name: p.name, problem: "Price is zero or missing" });
    if (!p.productImageUrl) issues.push({ id: p.id, name: p.name, problem: "No image" });
    if (!p.slug) issues.push({ id: p.id, name: p.name, problem: "No slug, page cannot be opened" });
    else if ((slugs.get(p.slug) ?? 0) > 1) issues.push({ id: p.id, name: p.name, problem: "Duplicate slug" });
    if (typeof p.compareAtPrice === "number" && p.compareAtPrice <= p.regularPrice) issues.push({ id: p.id, name: p.name, problem: "Was-price is not higher than the price" });
  }
  return issues;
}

const risky = /^[=+\-@\t\r]/;
/** CSV cell with quoting and spreadsheet-formula neutralising. */
export const csvCell = (value: unknown): string => {
  let text = value === undefined || value === null ? "" : String(value);
  if (risky.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export interface SystemCheck { label: string; ok: boolean; note: string }
