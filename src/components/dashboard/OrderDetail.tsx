"use client";

import Image from "next/image";
import Link from "next/link";
import { Printer, RotateCcw } from "lucide-react";
import { store, hasContact } from "@/config/store";
import { useOrderStore } from "@/stores/orderStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useReorder } from "@/hooks/useReorder";
import { formatCurrency } from "@/lib/utils";

export function OrderDetail({ reference }: { reference: string }) {
  const hydrated = useHydrated();
  const reorder = useReorder();
  const order = useOrderStore((s) => s.orders.find((o) => o.reference === reference));
  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" />;

  if (!order) {
    return (
      <div className="empty-state">
        <h2>Order not found on this device</h2>
        <p>Orders are saved on the device they were placed from.</p>
        <Link href="/dashboard/orders" className="btn btn-dark">All orders</Link>
      </div>
    );
  }

  const { customer } = order;
  const units = order.lines.reduce((n, l) => n + l.quantity, 0);
  const help = `Order ${order.reference}`;
  const whatsapp = store.contact.whatsapp.replace(/\D/g, "");

  return (
    <>
      <nav aria-label="Breadcrumb" className="crumbs no-print"><Link href="/dashboard/orders" className="underline">Orders</Link> / {order.reference}</nav>
      <div className="section-row">
        <h1 className="page-title">Order {order.reference}</h1>
        <div className="row no-print">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}><Printer size={15} /> Print invoice</button>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => reorder(order)}><RotateCcw size={15} /> Order again</button>
        </div>
      </div>
      <p className="muted">Placed on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })} · {units} {units === 1 ? "item" : "items"}</p>
      {!order.persisted && <p className="banner">Demo order: it was not sent to a store backend.</p>}

      <ol className="timeline" aria-label="Order progress">
        <li className="done"><strong>Order placed</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></li>
        <li><strong>Confirmation &amp; delivery</strong><small>The store contacts you on {customer.phone}</small></li>
        <li><strong>Pay on delivery</strong><small>{formatCurrency(order.total)} in cash</small></li>
      </ol>

      <div className="two-col">
        <section className="panel" aria-labelledby="items-h">
          <h2 id="items-h">Items</h2>
          <ul className="detail-lines">
            {order.lines.map((l) => (
              <li key={l.id}>
                <Link href={`/products/${l.slug}`} className="mini-thumb"><Image src={l.image} alt="" fill sizes="52px" /></Link>
                <span><Link href={`/products/${l.slug}`}><strong>{l.name}</strong></Link><small className="muted">{l.quantity} × {formatCurrency(l.unitPrice)}</small></span>
                <strong>{formatCurrency(l.unitPrice * l.quantity)}</strong>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
            {!!order.discount && <div className="discount"><dt>Promo {order.promoCode}</dt><dd>−{formatCurrency(order.discount)}</dd></div>}
            <div><dt>Delivery</dt><dd>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
          </dl>
        </section>

        <div className="stack">
          <section className="panel" aria-labelledby="ship-h">
            <h2 id="ship-h">Delivery details</h2>
            <address className="plain-address">
              <strong>{customer.fullName}</strong><br />
              {customer.address}<br />
              {customer.city}{customer.postalCode && `, ${customer.postalCode}`}<br />
              {customer.phone}<br />
              {customer.email}
            </address>
            {customer.notes && <p className="muted"><strong>Note:</strong> {customer.notes}</p>}
          </section>
          <section className="panel" aria-labelledby="pay-h">
            <h2 id="pay-h">Payment</h2>
            <p>Cash on delivery. Keep {formatCurrency(order.total)} ready when the order arrives.</p>
          </section>
          {hasContact && (
            <section className="panel no-print" aria-labelledby="help-h">
              <h2 id="help-h">Need help with this order?</h2>
              <div className="row">
                {whatsapp && <a className="btn btn-ghost btn-sm" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(help)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                {store.contact.email && <a className="btn btn-ghost btn-sm" href={`mailto:${store.contact.email}?subject=${encodeURIComponent(help)}`}>Email</a>}
                {store.contact.phone && <a className="btn btn-ghost btn-sm" href={`tel:${store.contact.phone.replace(/\s/g, "")}`}>Call</a>}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
