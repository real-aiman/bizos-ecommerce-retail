"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useToastStore } from "@/stores/toastStore";

export function WishlistButton({ id, name }: { id: number; name?: string }) {
  const active = useWishlistStore((s) => s.ids.includes(id));
  const toggle = useWishlistStore((s) => s.toggle);
  const push = useToastStore((s) => s.push);
  const label = `${active ? "Remove" : "Save"}${name ? ` ${name}` : ""} ${active ? "from" : "to"} wishlist`;
  return (
    <button type="button" className={`heart-button ${active ? "is-active" : ""}`} aria-pressed={active} aria-label={label} onClick={() => { toggle(id); push(active ? "Removed from wishlist" : "Saved to wishlist"); }}>
      <Heart size={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
