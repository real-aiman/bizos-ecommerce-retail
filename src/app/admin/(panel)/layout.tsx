import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { logout } from "../actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/promos", label: "Promo codes" },
  { href: "/admin/orders", label: "Orders" }
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container page admin-shell">
      <aside className="admin-nav" aria-label="Admin">
        <strong>Dashboard</strong>
        <nav>{links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
        <form action={logout}><button type="submit" className="btn btn-ghost btn-sm">Sign out</button></form>
      </aside>
      <main id="main" className="admin-main">{children}</main>
    </div>
  );
}
