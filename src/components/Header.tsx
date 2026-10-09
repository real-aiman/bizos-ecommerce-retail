"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { store } from "@/config/store";
import { formatCurrency } from "@/lib/utils";
import { CartBadge } from "./CartBadge";
import { WishlistBadge } from "./WishlistBadge";
import { SearchForm } from "./SearchForm";

export function Header({ departments, hasDeals = false }: { departments: string[]; hasDeals?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const links = [
    { href: "/", label: "Shop" },
    { href: "/categories", label: "Categories" },
    ...(hasDeals ? [{ href: "/deals", label: "Deals" }] : []),
    ...departments.map((d) => ({ href: `/?department=${encodeURIComponent(d)}#catalog`, label: d })),
    { href: "/dashboard", label: "Dashboard" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" }
  ];

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {store.shipping.freeOver > 0 && (
        <div className="announcement">Free delivery on orders over {formatCurrency(store.shipping.freeOver)}</div>
      )}
      <header className="site-header">
        <div className="header-inner">
          <button
            ref={toggleRef}
            type="button"
            className="icon-link menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="brand" aria-label={`${store.name} home`}>
            {store.wordmark}<span>.</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary">
            {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
          <div className="header-actions">
            <div className="search-desktop"><Suspense fallback={null}><SearchForm /></Suspense></div>
            <Link href="/dashboard" className="icon-link" aria-label="My dashboard and orders"><UserRound size={20} /></Link>
            <WishlistBadge />
            <CartBadge />
          </div>
        </div>
        <div id="mobile-nav" className={`mobile-nav ${menuOpen ? "open" : ""}`} hidden={!menuOpen}>
          <div className="mobile-search"><Suspense fallback={null}><SearchForm /></Suspense></div>
          <nav aria-label="Mobile primary">
            {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
        </div>
      </header>
      {menuOpen && <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
