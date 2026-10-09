import type { Metadata } from "next";
import { OrderSuccess } from "@/components/OrderSuccess";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  return (
    <main id="main" className="container page">
      <OrderSuccess reference={ref} />
    </main>
  );
}
