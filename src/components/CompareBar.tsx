"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompareStore } from "@/stores/compareStore";
import { useHydrated } from "@/hooks/useHydrated";

export function CompareBar() {
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);
  const hydrated = useHydrated();
  const pathname = usePathname();
  if (!hydrated || ids.length === 0 || pathname === "/compare") return null;
  return (
    <div className="compare-bar" role="region" aria-label="Product comparison">
      <span>{ids.length} selected</span>
      <Link href={`/compare?ids=${ids.join(",")}`} className={`btn btn-gold btn-sm ${ids.length < 2 ? "is-disabled" : ""}`} aria-disabled={ids.length < 2}>{ids.length < 2 ? "Pick one more" : "Compare"}</Link>
      <button type="button" className="link-danger" onClick={clear}>Clear</button>
    </div>
  );
}
