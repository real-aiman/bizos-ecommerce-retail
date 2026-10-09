import devProducts from "@/data/dev-products.json";
import { env } from "@/lib/env";
import type { BizosProduct, ProductListResponse } from "@/types/product";

function normalize(payload: unknown): ProductListResponse {
  const source = payload as Partial<ProductListResponse> & {
    items?: BizosProduct[];
    products?: BizosProduct[];
  };

  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(source.data)
      ? source.data
      : Array.isArray(source.items)
        ? source.items
        : Array.isArray(source.products)
          ? source.products
          : [];

  return {
    lastId: Number(source.lastId ?? 0),
    pageNo: Number(source.pageNo ?? 0),
    pageSize: Number((source.pageSize ?? data.length) || 10),
    totalCount: Number(source.totalCount ?? data.length),
    data: data as BizosProduct[]
  };
}

function buildUrl(page: number, pageSize: number): string {
  const base = env.bizosApiUrl.replace(/\/$/, "");
  const path = env.bizosProductsPath.startsWith("/") ? env.bizosProductsPath : `/${env.bizosProductsPath}`;
  const url = new URL(`${base}${path}`);
  url.searchParams.set("pageNo", String(page - 1));
  url.searchParams.set("pageSize", String(pageSize));
  return url.toString();
}

function emptyPage(page: number): ProductListResponse {
  return { lastId: 0, pageNo: page - 1, pageSize: 0, totalCount: (devProducts as ProductListResponse).totalCount, data: [] };
}

function fallback(page: number, reason: string): ProductListResponse {
  if (page === 1) console.warn(`[BizOS] Using bundled dev products: ${reason}`);
  return page > 1 ? emptyPage(page) : (devProducts as ProductListResponse);
}

export async function getProducts(page = 1, pageSize = 10): Promise<ProductListResponse> {
  if (!env.bizosApiUrl) {
    if (env.devFallback) return fallback(page, "BIZOS_API_URL is not set.");
    throw new Error("BIZOS_API_URL is not configured.");
  }

  const headers: HeadersInit = { Accept: "application/json" };
  if (env.bizosApiKey) headers.Authorization = `Bearer ${env.bizosApiKey}`;

  try {
    const response = await fetch(buildUrl(page, pageSize), {
      headers,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 60, tags: ["products"] }
    });

    if (!response.ok) {
      throw new Error(`BizOS products request failed with ${response.status}.`);
    }

    return normalize(await response.json());
  } catch (error) {
    if (env.devFallback) {
      return fallback(page, error instanceof Error ? error.message : "request failed.");
    }
    throw error;
  }
}