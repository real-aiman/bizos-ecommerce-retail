import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerDetails } from "@/lib/validation";

export type SavedAddress = Omit<CustomerDetails, "notes"> & { id: string };

interface ProfileState {
  /** Delivery details the shopper chose to remember on this device, most recent first. */
  addresses: SavedAddress[];
  save: (customer: Omit<CustomerDetails, "notes">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_ADDRESSES = 5;
const keyOf = (c: { address: string; phone: string }) => `${c.address.trim().toLowerCase()}|${c.phone.replace(/\D/g, "")}`;

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      addresses: [],
      save: (customer) =>
        set((state) => {
          const rest = state.addresses.filter((a) => keyOf(a) !== keyOf(customer));
          const id = state.addresses.find((a) => keyOf(a) === keyOf(customer))?.id ?? `a${Date.now().toString(36)}`;
          return { addresses: [{ ...customer, id }, ...rest].slice(0, MAX_ADDRESSES) };
        }),
      remove: (id) => set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) })),
      clear: () => set({ addresses: [] })
    }),
    {
      name: "bizos-retail-profile",
      version: 1,
      skipHydration: true,
      migrate: (persisted) => {
        const old = persisted as { customer?: Omit<CustomerDetails, "notes"> | null; addresses?: SavedAddress[] };
        if (old.addresses) return { addresses: old.addresses } as ProfileState;
        return { addresses: old.customer ? [{ ...old.customer, id: "a0" }] : [] } as ProfileState;
      }
    }
  )
);
