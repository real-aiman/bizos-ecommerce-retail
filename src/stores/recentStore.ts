import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentState {
  ids: number[];
  view: (id: number) => void;
  clear: () => void;
}

export const MAX_RECENT = 8;

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      view: (id) => set((state) => ({ ids: [id, ...state.ids.filter((x) => x !== id)].slice(0, MAX_RECENT) })),
      clear: () => set({ ids: [] })
    }),
    { name: "bizos-retail-recent", skipHydration: true }
  )
);
