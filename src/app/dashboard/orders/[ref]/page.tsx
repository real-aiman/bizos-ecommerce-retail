import type { Metadata } from "next";
import { OrderDetail } from "@/components/dashboard/OrderDetail";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <OrderDetail reference={decodeURIComponent(ref)} />;
}
