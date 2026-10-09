"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useToastStore, type Toast } from "@/stores/toastStore";

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 4000);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);
  return (
    <li className="toast">
      <span>{toast.message}</span>
      {toast.action && (
        <button type="button" className="toast-action" onClick={() => { toast.action?.run(); dismiss(toast.id); }}>{toast.action.label}</button>
      )}
      <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => dismiss(toast.id)}><X size={14} /></button>
    </li>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <ul className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </ul>
  );
}
