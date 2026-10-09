import type { Metadata } from "next";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Dashboard" }, robots: { index: false } };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container page admin-shell dash-shell">
      <DashboardNav />
      <main id="main" className="admin-main">{children}</main>
    </div>
  );
}
