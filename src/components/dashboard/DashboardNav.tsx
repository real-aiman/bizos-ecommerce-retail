"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrderStore } from "@/stores/orderStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useHydrated } from "@/hooks/useHydrated";

export function DashboardNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const orders = useOrderStore((s) => s.orders.length);
  const wishlist = useWishlistStore((s) => s.ids.length);
  const items = [
    { href: "/dashboard", label: "Overview", exact: true },
    { href: "/dashboard/orders", label: "Orders", count: orders },
    { href: "/dashboard/addresses", label: "Addresses" },
    { href: "/wishlist", label: "Wishlist", count: wishlist }
  ];
  return (
    <aside className="admin-nav dash-nav" aria-label="Dashboard">
      <strong>My dashboard</strong>
      <nav>
        {items.map((i) => {
          const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}>
              {i.label}{hydrated && !!i.count && <span className="nav-count">{i.count}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
