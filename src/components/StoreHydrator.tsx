"use client";

import { useEffect } from "react";
import { persistedStores } from "@/hooks/useHydrated";

/** Loads saved cart/wishlist/orders after first paint (no hydration mismatch) and syncs across tabs. */
export function StoreHydrator() {
  useEffect(() => {
    persistedStores.forEach((s) => void s.persist.rehydrate());
    const onStorage = (event: StorageEvent) => {
      persistedStores.forEach((s) => {
        if (event.key === s.persist.getOptions().name) void s.persist.rehydrate();
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
