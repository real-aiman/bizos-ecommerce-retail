"use client";

import { Scale } from "lucide-react";
import { useCompareStore, MAX_COMPARE } from "@/stores/compareStore";
import { useToastStore } from "@/stores/toastStore";

export function CompareButton({ id, name }: { id: number; name: string }) {
  const active = useCompareStore((s) => s.ids.includes(id));
  const toggle = useCompareStore((s) => s.toggle);
  const push = useToastStore((s) => s.push);
  return (
    <button
      type="button"
      className={`heart-button ${active ? "is-active" : ""}`}
      aria-pressed={active}
      aria-label={`${active ? "Remove" : "Add"} ${name} ${active ? "from" : "to"} comparison`}
      onClick={() => { if (!toggle(id)) push(`You can compare up to ${MAX_COMPARE} products.`); }}
    >
      <Scale size={17} />
    </button>
  );
}
