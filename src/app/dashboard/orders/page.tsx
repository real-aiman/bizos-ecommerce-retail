import type { Metadata } from "next";
import { OrdersList } from "@/components/dashboard/OrdersList";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <OrdersList />;
}
