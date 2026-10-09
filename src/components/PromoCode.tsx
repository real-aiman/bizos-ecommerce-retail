"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";
import { applyPromo } from "@/modules/orders/actions/applyPromo";

export function PromoCode({ message }: { message: string | null }) {
  const items = useCartStore((s) => s.items);
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const push = useToastStore((s) => s.push);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await applyPromo(code, items.map((i) => ({ id: i.product.id, quantity: i.quantity })));
      if (!result.ok) return setError(result.message);
      setPromo(result.promo);
      setCode("");
      push(`Code ${result.promo.code} applied`);
    });
  }

  if (promo) {
    return (
      <div className="promo applied">
        <span><Tag size={15} aria-hidden="true" /> <strong>{promo.code}</strong></span>
        <button type="button" className="link-danger" onClick={() => setPromo(null)} aria-label={`Remove code ${promo.code}`}><X size={14} /> Remove</button>
        {message && <p className="field-error" role="alert">{message}</p>}
      </div>
    );
  }

  return (
    <form className="promo" onSubmit={submit}>
      <label htmlFor="promo-code" className="sr-only">Promo code</label>
      <input id="promo-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" maxLength={32} autoComplete="off" aria-invalid={error ? true : undefined} />
      <button type="submit" className="btn btn-ghost btn-sm" disabled={pending || !code.trim()}>{pending ? "Checking…" : "Apply"}</button>
      {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  );
}
