import type { Metadata } from "next";
import { AddressBook } from "@/components/dashboard/AddressBook";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return <AddressBook />;
}
