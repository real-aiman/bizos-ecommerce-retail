import Link from "next/link";
import { catalogHref, type CatalogQuery } from "@/lib/catalog";

export function Pagination({ query, totalCount, pageSize, basePath = "/" }: { query: CatalogQuery; totalCount: number; pageSize: number; basePath?: string }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;
  const href = (page: number) => `${catalogHref(query, { page }, basePath)}${basePath === "/" ? "#catalog" : ""}`;
  return (
    <nav className="pagination" aria-label="Product pages">
      {query.page > 1 ? <Link href={href(query.page - 1)} rel="prev">Previous</Link> : <span className="disabled">Previous</span>}
      <span>Page {query.page} of {totalPages}</span>
      {query.page < totalPages ? <Link href={href(query.page + 1)} rel="next">Next</Link> : <span className="disabled">Next</span>}
    </nav>
  );
}
