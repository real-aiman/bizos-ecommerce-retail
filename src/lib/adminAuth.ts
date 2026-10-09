import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { env } from "@/lib/env";

export const ADMIN_COOKIE = "bizos_admin";
export const SESSION_SECONDS = 8 * 60 * 60;
const MIN_PASSWORD = 12;

/** Admin is off unless a reasonably long password is configured. */
export const adminEnabled = () => env.adminPassword.length >= MIN_PASSWORD;

const key = () => createHash("sha256").update(`bizos-admin:${env.adminSessionSecret}:${env.adminPassword}`).digest();

export const sign = (expires: number, secret: Buffer = key()) => createHmac("sha256", secret).update(String(expires)).digest("hex");

export function makeToken(now = Date.now(), secret: Buffer = key()): string {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${expires}.${sign(expires, secret)}`;
}

export function verifyToken(token: string | undefined, now = Date.now(), secret: Buffer = key()): boolean {
  if (!token) return false;
  const [exp, sig, extra] = token.split(".");
  const expires = Number(exp);
  if (extra !== undefined || !sig || !Number.isInteger(expires) || expires * 1000 < now) return false;
  const expected = Buffer.from(sign(expires, secret), "hex");
  const given = Buffer.from(sig, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Constant-time password check that does not leak length. */
export function passwordMatches(input: string, actual = env.adminPassword): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(actual).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  return adminEnabled() && verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Call at the top of every admin page, action and route. Disabled admin looks like a missing page. */
export async function requireAdmin(): Promise<void> {
  if (!adminEnabled()) notFound();
  if (!(await isAdmin())) redirect("/admin/login");
}
