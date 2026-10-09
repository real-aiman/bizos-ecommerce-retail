import { cache } from "react";
import { getProducts } from "@/modules/products/api/getProducts";
import type { BizosProduct } from "@/types/product";

const PAGE = 100;
const MAX_PAGES = 20;

export async function getProductCatalog(page = 1, pageSize = 10) {
  const result = await getProducts(page, pageSize);
  return { products: result.data, totalCount: result.totalCount, page: result.pageNo + 1, pageSize: result.pageSize };
}

/** Whole catalog, de-duplicated per request. Pages through the API until it is exhausted. */
export const getAllProducts = cache(async (): Promise<BizosProduct[]> => {
  const all: BizosProduct[] = [];
  const seen = new Set<number>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await getProducts(page, PAGE);
    for (const product of result.data) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        all.push(product);
      }
    }
    if (result.data.length < PAGE || all.length >= result.totalCount) break;
  }
  return all;
});

export async function getProductBySlug(slug: string) {
  return (await getAllProducts()).find((product) => product.slug === slug);
}

export async function getRelatedProducts(product: BizosProduct, limit = 4) {
  const all = await getAllProducts();
  return all.filter((p) => p.id !== product.id && p.departmentName === product.departmentName).slice(0, limit);
}

export async function getDepartments(): Promise<string[]> {
  try {
    return [...new Set((await getAllProducts()).map((p) => p.departmentName))].sort();
  } catch {
    return [];
  }
}
