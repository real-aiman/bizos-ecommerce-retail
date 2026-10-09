import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/modules/products/services/productService";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatCurrency } from "@/lib/utils";
import { savingsPercent } from "@/lib/deals";
import { MAX_COMPARE } from "@/stores/compareStore";

export const metadata: Metadata = { title: "Compare products", robots: { index: false } };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const ids = [...new Set(((await searchParams).ids ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX_COMPARE);
  const all = await getAllProducts();
  const items = ids.flatMap((id) => all.find((p) => p.id === id) ?? []);

  if (items.length < 2) {
    return (
      <main id="main" className="container page">
        <h1 className="page-title">Compare</h1>
        <div className="empty-state"><h2>Pick at least two products</h2><p>Use the scale icon on product cards to add items to compare.</p><Link href="/#catalog" className="btn btn-dark">Browse products</Link></div>
      </main>
    );
  }

  const rows: [string, (p: (typeof items)[number]) => React.ReactNode][] = [
    ["Price", (p) => <>{formatCurrency(p.regularPrice)}{savingsPercent(p) > 0 && <small className="was"> {formatCurrency(p.compareAtPrice!)}</small>}</>],
    ["Department", (p) => p.departmentName],
    ["Brand", (p) => p.brand || "—"],
    ["Sold per", (p) => p.productMeasureUnitName || "—"],
    ["Availability", (p) => (p.inStock === undefined ? "—" : p.inStock ? "In stock" : "Out of stock")],
    ["About", (p) => p.description || "—"]
  ];
  const cheapest = Math.min(...items.map((p) => p.regularPrice));

  return (
    <main id="main" className="container page">
      <h1 className="page-title">Compare</h1>
      <div className="table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Feature</span></th>
              {items.map((p) => (
                <th scope="col" key={p.id}>
                  <Link href={`/products/${p.slug}`} className="compare-head">
                    <span className="mini-thumb big"><Image src={p.productImageUrl} alt="" fill sizes="120px" /></span>
                    <strong>{p.name}</strong>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, cell]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {items.map((p) => <td key={p.id} className={label === "Price" && p.regularPrice === cheapest ? "best" : ""}>{cell(p)}{label === "Price" && p.regularPrice === cheapest && <small className="best-tag"> Lowest</small>}</td>)}
              </tr>
            ))}
            <tr><th scope="row"><span className="sr-only">Buy</span></th>{items.map((p) => <td key={p.id}>{p.inStock === false ? <span className="muted">Unavailable</span> : <AddToCartButton product={p} />}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
