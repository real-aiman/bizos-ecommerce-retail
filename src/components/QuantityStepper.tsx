"use client";

import { Minus, Plus } from "lucide-react";
import { store } from "@/config/store";

export function QuantityStepper({ value, onChange, label }: { value: number; onChange: (next: number) => void; label: string }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}><Minus size={14} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= store.limits.maxQuantity} onClick={() => onChange(value + 1)}><Plus size={14} /></button>
    </div>
  );
}
