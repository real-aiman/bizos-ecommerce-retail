import Image from "next/image";
import Link from "next/link";
import { filterProducts, filterQuery, parseProductFilter } from "@/lib/adminProducts";
import { departmentCounts } from "@/lib/catalog";
import { isOnSale } from "@/lib/deals";
import { formatCurrency } from "@/lib/utils";
import { getAllProducts } from "@/modules/products/services/productService";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };
const PAGE = 50;

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = parseProductFilter(sp);
  const all = await getAllProducts();
  const rows = filterProducts(all, f);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const page = Math.min(pages, Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1));
  const visible = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <>
      <h1 className="page-title">Products</h1>
      <form className="admin-filters" method="get">
        <input name="q" defaultValue={f.q} placeholder="Name, brand or ID" aria-label="Search products" />
        <select name="department" defaultValue={f.department} aria-label="Department">
          <option value="">All departments</option>
          {departmentCounts(all).map((d) => <option key={d.name} value={d.name}>{d.name} ({d.count})</option>)}
        </select>
        <select name="stock" defaultValue={f.stock} aria-label="Stock"><option value="">Any stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select>
        <select name="sort" defaultValue={f.sort} aria-label="Sort"><option value="name">Name</option><option value="price-asc">Price low–high</option><option value="price-desc">Price high–low</option></select>
        <label className="remember"><input type="checkbox" name="sale" value="1" defaultChecked={f.sale} /> On sale</label>
        <button className="btn btn-dark btn-sm" type="submit">Filter</button>
        <a className="btn btn-ghost btn-sm" href={`/admin/export?${filterQuery(f)}`} download>Export CSV</a>
      </form>
      <p className="muted" aria-live="polite">{rows.length} of {all.length} products</p>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th scope="col">Product</th><th scope="col">Department</th><th scope="col">Price</th><th scope="col">Stock</th><th scope="col">ID</th></tr></thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/products/${p.slug}`} className="admin-prod"><span className="mini-thumb">{p.productImageUrl && <Image src={p.productImageUrl} alt="" fill sizes="52px" />}</span><strong>{p.name}</strong></Link></td>
                <td>{p.departmentName}</td>
                <td>{formatCurrency(p.regularPrice)}{isOnSale(p) && <s className="was">{formatCurrency(p.compareAtPrice!)}</s>}</td>
                <td>{p.inStock === undefined ? "—" : p.inStock ? "In stock" : <span className="pill-warn">Out</span>}</td>
                <td className="muted">{p.id}</td>
              </tr>
            ))}
            {!visible.length && <tr><td colSpan={5} className="muted">No products match.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav className="pagination" aria-label="Pages">
          {page > 1 && <Link href={`/admin/products?${filterQuery(f, { page: String(page - 1) })}`}>Previous</Link>}
          <span>Page {page} of {pages}</span>
          {page < pages && <Link href={`/admin/products?${filterQuery(f, { page: String(page + 1) })}`}>Next</Link>}
        </nav>
      )}
    </>
  );
}
