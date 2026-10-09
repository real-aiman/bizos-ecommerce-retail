import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: number[];
  toggle: (id: number) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids.filter((value) => value !== id) : [...state.ids, id]
        }))
    }),
    { name: "bizos-retail-wishlist", skipHydration: true }
  )
);
