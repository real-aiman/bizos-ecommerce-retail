import { env } from "@/lib/env";
import { parsePromos } from "@/lib/promo";
import { catalogIssues, catalogStats, type SystemCheck } from "@/lib/adminStats";
import { formatCurrency } from "@/lib/utils";
import { getAllProducts } from "@/modules/products/services/productService";

export const dynamic = "force-dynamic";

function systemChecks(): SystemCheck[] {
  let rawCount = 0;
  try { const j: unknown = JSON.parse(env.promoCodes || "[]"); rawCount = Array.isArray(j) ? j.length : 0; } catch { rawCount = -1; }
  const valid = parsePromos(env.promoCodes).length;
  const prod = process.env.NODE_ENV === "production";
  return [
    { label: "Product API", ok: !!env.bizosApiUrl, note: env.bizosApiUrl ? "BIZOS_API_URL is set." : "Not set: the storefront shows bundled sample data." },
    { label: "Orders are saved", ok: !!env.bizosOrdersPath, note: env.bizosOrdersPath ? "Orders are POSTed to the backend." : "BIZOS_ORDERS_PATH is empty: customers cannot place real orders." },
    { label: "Simulated orders off", ok: !(prod && env.allowSimulatedOrders), note: env.allowSimulatedOrders ? "On: orders are accepted but sent nowhere." : "Off." },
    { label: "Promo codes valid", ok: rawCount !== -1 && valid === rawCount, note: rawCount === -1 ? "BIZOS_PROMO_CODES is not valid JSON." : `${valid} of ${rawCount} entries are valid.` },
    { label: "Site URL", ok: !prod || !env.siteUrl.includes("localhost"), note: env.siteUrl },
    { label: "Analytics", ok: !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, note: "GA4 or Mixpanel configured." },
    { label: "Error monitoring", ok: !!process.env.NEXT_PUBLIC_SENTRY_DSN, note: "Sentry DSN configured." }
  ];
}

export default async function AdminOverview() {
  const products = await getAllProducts();
  const stats = catalogStats(products);
  const issues = catalogIssues(products);
  const today = new Date().toISOString().slice(0, 10);
  const activePromos = parsePromos(env.promoCodes).filter((p) => !p.expires || p.expires >= today).length;
  const max = Math.max(1, ...stats.byDepartment.map((d) => d.count));
  const kpis: [string, string][] = [
    ["Products", String(stats.total)], ["Departments", String(stats.departments)], ["On sale", String(stats.onSale)],
    ["Out of stock", String(stats.outOfStock)], ["Average price", formatCurrency(stats.averagePrice)], ["Active promos", String(activePromos)]
  ];

  return (
    <>
      <h1 className="page-title">Overview</h1>
      <div className="kpi-grid">{kpis.map(([label, value]) => <div className="kpi" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>

      <section className="panel" aria-labelledby="dep-h">
        <h2 id="dep-h">Products by department</h2>
        <ul className="bars">
          {stats.byDepartment.map((d) => (
            <li key={d.name}>
              <span>{d.name}</span>
              <span className="bar"><i style={{ width: `${(d.count / max) * 100}%` }} /></span>
              <span className="muted">{d.count} · avg {formatCurrency(d.averagePrice)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="two-col">
        <section className="panel" aria-labelledby="sys-h">
          <h2 id="sys-h">System checks</h2>
          <ul className="checks">
            {systemChecks().map((c) => <li key={c.label} className={c.ok ? "ok" : "warn"}><strong>{c.ok ? "OK" : "Check"}</strong><span>{c.label}<small className="muted">{c.note}</small></span></li>)}
          </ul>
        </section>
        <section className="panel" aria-labelledby="iss-h">
          <h2 id="iss-h">Catalog issues <span className="muted">({issues.length})</span></h2>
          {issues.length === 0 ? <p className="muted">No problems found in {stats.total} products.</p> : (
            <ul className="checks">{issues.slice(0, 12).map((i, n) => <li key={`${i.id}-${n}`} className="warn"><strong>#{i.id}</strong><span>{i.name}<small className="muted">{i.problem}</small></span></li>)}</ul>
          )}
          {issues.length > 12 && <p className="muted">…and {issues.length - 12} more.</p>}
        </section>
      </div>
    </>
  );
}
