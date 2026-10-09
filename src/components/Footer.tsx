import Link from "next/link";
import { store, hasContact } from "@/config/store";

export function Footer({ departments }: { departments: string[] }) {
  const { contact } = store;
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">{store.wordmark}<span>.</span></div>
          <p>Prices shown in {store.currency}. Cash on delivery available.</p>
        </div>
        <nav aria-label="Shop">
          <h2>Shop</h2>
          {departments.map((d) => <Link key={d} href={`/?department=${encodeURIComponent(d)}#catalog`}>{d}</Link>)}
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/cart">Cart</Link>
        </nav>
        <nav aria-label="Help">
          <h2>Help</h2>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/about">About</Link>
        </nav>
        {hasContact && (
          <div>
            <h2>Talk to us</h2>
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
            {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>}
            {contact.hours && <span>{contact.hours}</span>}
          </div>
        )}
      </div>
      <div className="container footer-base">© {new Date().getFullYear()} {store.name}</div>
    </footer>
  );
}
