"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, catalogHref, type CatalogQuery } from "@/lib/catalog";

export function SortSelect({ query, basePath = "/" }: { query: CatalogQuery; basePath?: string }) {
  const router = useRouter();
  return (
    <label className="sort">
      <span>Sort</span>
      <select
        value={query.sort}
        onChange={(e) => router.push(`${catalogHref(query, { sort: e.target.value as CatalogQuery["sort"], page: 1 }, basePath)}${basePath === "/" ? "#catalog" : ""}`, { scroll: false })}
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
