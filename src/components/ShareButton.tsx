"use client";

import { Share2 } from "lucide-react";
import { useToastStore } from "@/stores/toastStore";

export function ShareButton({ title }: { title: string }) {
  const push = useToastStore((s) => s.push);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); push("Link copied"); }
    } catch { /* user cancelled */ }
  }
  return <button type="button" className="btn btn-ghost btn-sm share-btn" onClick={share}><Share2 size={15} /> Share</button>;
}
