import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/config/store";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "FAQ", description: `Answers about ordering, delivery and payment at ${store.name}.` };

const faqs: [string, string][] = [
  ["How do I pay?", store.payments.cashOnDelivery ? "Pay in cash when your order arrives. Card and wallet payments are not available yet." : "Payment options are shown at checkout."],
  ["How much is delivery?", store.shipping.freeOver > 0 ? `Delivery is free on orders of ${formatCurrency(store.shipping.freeOver)} or more. Otherwise it is ${store.shipping.flatRate > 0 ? formatCurrency(store.shipping.flatRate) : "shown at checkout"}.` : store.shipping.flatRate > 0 ? `Delivery is ${formatCurrency(store.shipping.flatRate)} per order.` : "Delivery cost is shown in your cart and at checkout before you order."],
  ["How long does delivery take?", store.policies.delivery || "Contact us with your city and the product you want, and we will confirm the delivery time."],
  ["Can I return a product?", store.policies.returns || "Contact us before sending anything back so we can confirm whether the item is eligible."],
  ["Where are my orders?", "Orders you place are listed under Your orders on the same device and browser you used to place them."],
  ["Is my cart saved?", "Yes. Your cart and wishlist stay on this device until you clear them or your browser data."],
  ["Can the price change?", "Prices can be updated by the store. If a price changed after you added an item, you will see the new total before the order is placed."]
];

export default function FaqPage() {
  return (
    <main id="main" className="container page prose">
      <h1 className="page-title">Frequently asked questions</h1>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details className="faq-item" key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <p><Link href="/contact" className="underline">Still need help? Contact us.</Link></p>
    </main>
  );
}
