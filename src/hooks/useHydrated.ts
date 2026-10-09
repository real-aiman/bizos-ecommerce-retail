"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useProfileStore } from "@/stores/profileStore";
import { useRecentStore } from "@/stores/recentStore";
import { useCompareStore } from "@/stores/compareStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export const persistedStores = [useCartStore, useWishlistStore, useOrderStore, useProfileStore, useRecentStore, useCompareStore] as const;

const allHydrated = () => persistedStores.every((s) => s.persist.hasHydrated());

function subscribe(callback: () => void) {
  const unsubs = persistedStores.map((s) => s.persist.onFinishHydration(callback));
  return () => unsubs.forEach((off) => off());
}

/** true once localStorage-backed stores have loaded on the client (false on the server). */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated, () => false);
}
