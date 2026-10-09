import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 3;

interface CompareState {
  ids: number[];
  /** Returns false when the list is full and the id was not added. */
  toggle: (id: number) => boolean;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) { set({ ids: ids.filter((x) => x !== id) }); return true; }
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      clear: () => set({ ids: [] })
    }),
    { name: "bizos-retail-compare", skipHydration: true }
  )
);
