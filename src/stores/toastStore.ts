import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, action?: Toast["action"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, action) => set((state) => ({ toasts: [...state.toasts, { id: nextId++, message, action }].slice(-3) })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));
