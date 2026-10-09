import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <main id="main" className="container page">
      <h1 className="page-title">Your cart</h1>
      <CartView />
    </main>
  );
}
