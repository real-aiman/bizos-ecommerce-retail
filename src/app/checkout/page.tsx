import type { Metadata } from "next";
import { CheckoutView } from "@/components/CheckoutView";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <main id="main" className="container page">
      <h1 className="page-title">Checkout</h1>
      <CheckoutView />
    </main>
  );
}
