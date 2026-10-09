import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/config/store";

export const metadata: Metadata = { title: "About", description: `About ${store.name} and how ordering works.` };

export default function AboutPage() {
  return (
    <main id="main" className="container page prose">
      <h1 className="page-title">About {store.name}</h1>
      <p className="lead">{store.name} is an online store for laptops, phones and electric mobility. Prices come straight from our live catalog, and you pay in cash when your order arrives.</p>
      <h2>What to expect</h2>
      <ul>
        <li>The price you see on a product is the price you pay. Totals are checked again on our server when you order.</li>
        <li>Delivery and totals are shown before you place an order.</li>
        <li>Your cart, wishlist and order history are stored on your own device.</li>
      </ul>
      {store.policies.delivery && (<><h2>Delivery</h2><p>{store.policies.delivery}</p></>)}
      {store.policies.returns && (<><h2>Returns</h2><p>{store.policies.returns}</p></>)}
      <p><Link href="/contact" className="underline">Questions? Get in touch.</Link></p>
    </main>
  );
}
