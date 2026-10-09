import { store } from "@/config/store";
import { formatCurrency } from "@/lib/utils";

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const goal = store.shipping.freeOver;
  if (goal <= 0 || subtotal <= 0) return null;
  const done = subtotal >= goal;
  return (
    <div className="progress-note">
      <p>{done ? "Delivery is free on this order." : `Add ${formatCurrency(goal - subtotal)} more for free delivery.`}</p>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(subtotal, goal)} aria-label="Progress to free delivery">
        <span style={{ width: `${Math.min(100, (subtotal / goal) * 100)}%` }} />
      </div>
    </div>
  );
}
