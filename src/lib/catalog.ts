import type { BizosProduct } from "@/types/product";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" }
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export interface CatalogQuery {
  q: string;
  department: string;
  sort: SortKey;
  min?: number;
  max?: number;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const price = (value: string) => {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const sort = first(params.sort) as SortKey;
  return {
    q: first(params.q).trim().slice(0, 80),
    department: first(params.department).trim(),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : "featured",
    min: price(first(params.min)),
    max: price(first(params.max)),
    page: Math.max(1, Math.floor(Number(first(params.page))) || 1)
  };
}

export function applyCatalogQuery(products: BizosProduct[], query: CatalogQuery): BizosProduct[] {
  const tokens = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = products.filter((product) => {
    if (query.department && product.departmentName !== query.department) return false;
    if (query.min !== undefined && product.regularPrice < query.min) return false;
    if (query.max !== undefined && product.regularPrice > query.max) return false;
    const haystack = `${product.name} ${product.departmentName}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
  if (query.sort === "price-asc") return [...rows].sort((a, b) => a.regularPrice - b.regularPrice);
  if (query.sort === "price-desc") return [...rows].sort((a, b) => b.regularPrice - a.regularPrice);
  if (query.sort === "name") return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export function catalogHref(query: Partial<CatalogQuery>, overrides: Partial<CatalogQuery> = {}, base = "/"): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.department) params.set("department", merged.department);
  if (merged.sort && merged.sort !== "featured") params.set("sort", merged.sort);
  if (merged.min !== undefined) params.set("min", String(merged.min));
  if (merged.max !== undefined) params.set("max", String(merged.max));
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function departmentCounts(products: BizosProduct[]) {
  const map = new Map<string, number>();
  for (const product of products) map.set(product.departmentName, (map.get(product.departmentName) ?? 0) + 1);
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

export function unitLabel(product: BizosProduct): string | null {
  const unit = product.productMeasureUnitName?.trim().toLowerCase();
  return !unit || unit === "unit" ? null : unit;
}
