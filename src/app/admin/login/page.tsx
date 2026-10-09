import { notFound, redirect } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/adminAuth";
import { login } from "../actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (!adminEnabled()) notFound();
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  return (
    <main id="main" className="container page admin-login">
      <h1 className="page-title">Admin sign in</h1>
      <form action={login} className="panel">
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} aria-invalid={e ? true : undefined} />
        </div>
        {e === "bad" && <p className="field-error" role="alert">Wrong password.</p>}
        {e === "wait" && <p className="field-error" role="alert">Too many attempts. Try again in 15 minutes.</p>}
        <button type="submit" className="btn btn-dark">Sign in</button>
      </form>
    </main>
  );
}
