"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const TYPE_COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: "var(--color-surface)", border: "var(--color-success)", text: "var(--color-success)" },
  error: { bg: "var(--color-surface)", border: "var(--color-danger)", text: "var(--color-danger)" },
  info: { bg: "var(--color-surface)", border: "var(--color-accent)", text: "var(--color-accent)" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => {
          const colors = TYPE_COLORS[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto px-4 py-3 text-sm font-medium animate-fade-in"
              style={{
                background: colors.bg,
                borderLeft: `2px solid ${colors.border}`,
                color: colors.text,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
