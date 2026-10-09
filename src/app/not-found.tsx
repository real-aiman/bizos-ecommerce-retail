import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="container page">
      <div className="empty-state">
        <h1>Page not found</h1>
        <p>That page or product isn&apos;t here anymore.</p>
        <Link href="/" className="btn btn-dark">Back to shop</Link>
      </div>
    </main>
  );
}
