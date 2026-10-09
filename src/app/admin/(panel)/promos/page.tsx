import { env } from "@/lib/env";
import { parsePromos } from "@/lib/promo";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Promo codes" };

export default function AdminPromos() {
  const promos = parsePromos(env.promoCodes);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <h1 className="page-title">Promo codes</h1>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th scope="col">Code</th><th scope="col">Discount</th><th scope="col">Minimum</th><th scope="col">Cap</th><th scope="col">Expires</th><th scope="col">Listed</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {promos.map((p) => {
              const expired = !!p.expires && p.expires < today;
              return (
                <tr key={p.code}>
                  <td><strong>{p.code}</strong></td>
                  <td>{p.type === "percent" ? `${p.value}%` : formatCurrency(p.value)}</td>
                  <td>{p.minSubtotal ? formatCurrency(p.minSubtotal) : "—"}</td>
                  <td>{p.maxDiscount ? formatCurrency(p.maxDiscount) : "—"}</td>
                  <td>{p.expires ?? "Never"}</td>
                  <td>{p.public ? "On /deals" : "Hidden"}</td>
                  <td>{expired ? <span className="pill-warn">Expired</span> : <span className="pill-ok">Active</span>}</td>
                </tr>
              );
            })}
            {!promos.length && <tr><td colSpan={7} className="muted">No promo codes configured.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted">Codes live in the <code>BIZOS_PROMO_CODES</code> environment variable so they can never be changed from the browser. Edit it in your hosting settings and redeploy. Invalid entries are ignored.</p>
    </>
  );
}
