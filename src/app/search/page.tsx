import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/config/store";
import { getAllProducts } from "@/modules/products/services/productService";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { SortSelect } from "@/components/SortSelect";
import { applyCatalogQuery, catalogHref, departmentCounts, parseCatalogQuery } from "@/lib/catalog";
import { clampPage } from "@/lib/utils";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parsed = parseCatalogQuery(await searchParams);
  const all = await getAllProducts();
  const matches = applyCatalogQuery(all, { ...parsed, department: "" });
  const filtered = applyCatalogQuery(all, parsed);
  const page = clampPage(parsed.page, filtered.length, store.limits.pageSize);
  const query = { ...parsed, page };
  const rows = filtered.slice((page - 1) * store.limits.pageSize, page * store.limits.pageSize);
  const departments = departmentCounts(matches);

  return (
    <main id="main" className="container page">
      <h1 className="page-title">{parsed.q ? `Results for “${parsed.q}”` : "Search"}</h1>
      <p className="muted" aria-live="polite">{filtered.length} {filtered.length === 1 ? "product" : "products"} found</p>
      <div className="filters">
        <nav className="pills" aria-label="Narrow by department">
          <Link href={catalogHref(query, { department: "", page: 1 }, "/search")} aria-current={!parsed.department ? "true" : undefined}>All <small>{matches.length}</small></Link>
          {departments.map((d) => (
            <Link key={d.name} href={catalogHref(query, { department: d.name, page: 1 }, "/search")} aria-current={parsed.department === d.name ? "true" : undefined}>{d.name} <small>{d.count}</small></Link>
          ))}
        </nav>
        <div className="filter-tools"><SortSelect query={query} basePath="/search" /></div>
      </div>
      {rows.length ? (
        <ProductGrid products={rows} />
      ) : (
        <div className="empty-state">
          <h2>Nothing matched “{parsed.q}”</h2>
          <p>Check the spelling, try fewer words, or browse by category.</p>
          <Link href="/categories" className="btn btn-dark">Browse categories</Link>
        </div>
      )}
      <Pagination query={query} totalCount={filtered.length} pageSize={store.limits.pageSize} basePath="/search" />
    </main>
  );
}
