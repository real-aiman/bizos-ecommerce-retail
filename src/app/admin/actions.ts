"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_SECONDS, adminEnabled, makeToken, passwordMatches } from "@/lib/adminAuth";

const attempts = new Map<string, { count: number; reset: number }>();
const WINDOW = 15 * 60_000;
const LIMIT = 5;

/** Best-effort throttle (per server instance). The long password requirement is the real protection. */
function throttled(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) { attempts.set(ip, { count: 1, reset: now + WINDOW }); return false; }
  entry.count++;
  return entry.count > LIMIT;
}

export async function login(formData: FormData) {
  if (!adminEnabled()) redirect("/admin/login");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) redirect("/admin/login?e=wait");
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!passwordMatches(password)) redirect("/admin/login?e=bad");
  attempts.delete(ip);
  (await cookies()).set(ADMIN_COOKIE, makeToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: SESSION_SECONDS });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
