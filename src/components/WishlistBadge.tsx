"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";

export function WishlistBadge() {
  const count = useWishlistStore((s) => s.ids.length);
  return (
    <Link href="/wishlist" className="icon-link" aria-label={`Wishlist, ${count} saved`}>
      <Heart size={20} />
      {count > 0 && <span className="badge">{count}</span>}
    </Link>
  );
}
