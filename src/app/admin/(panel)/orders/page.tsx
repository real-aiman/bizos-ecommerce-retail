import { fetchAdminOrders } from "@/lib/adminOrders";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function AdminOrders() {
  const result = await fetchAdminOrders();
  if (result.state === "unconfigured") {
    return (
      <>
        <h1 className="page-title">Orders</h1>
        <div className="panel">
          <h2>Connect an orders feed</h2>
          <p className="muted">This storefront sends orders to your backend but does not keep its own copy. Set <code>BIZOS_ORDERS_LIST_PATH</code> to a GET endpoint that returns your orders as JSON (an array, or an object with <code>data</code> or <code>orders</code>) and they will list here. Fields read: reference or orderNumber, createdAt, customer name, total, status.</p>
        </div>
      </>
    );
  }
  if (result.state === "error") return <><h1 className="page-title">Orders</h1><div className="panel"><p className="field-error" role="alert">{result.message}</p></div></>;

  const { orders } = result;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  return (
    <>
      <h1 className="page-title">Orders</h1>
      <div className="kpi-grid">
        <div className="kpi"><small>Orders</small><strong>{orders.length}</strong></div>
        <div className="kpi"><small>Revenue</small><strong>{formatCurrency(revenue)}</strong></div>
        <div className="kpi"><small>Average order</small><strong>{formatCurrency(orders.length ? revenue / orders.length : 0)}</strong></div>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col">Total</th></tr></thead>
          <tbody>
            {orders.slice(0, 200).map((o, i) => <tr key={`${o.reference}-${i}`}><td><strong>{o.reference}</strong></td><td>{o.date ? new Date(o.date).toLocaleDateString() : "—"}</td><td>{o.customer || "—"}</td><td>{o.status}</td><td>{formatCurrency(o.total)}</td></tr>)}
            {!orders.length && <tr><td colSpan={5} className="muted">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
