"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  txHash?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, txHash?: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", txHash?: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, txHash }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 ${
              t.type === "success"
                ? "border-emerald-800 bg-emerald-950/90 text-emerald-300"
                : t.type === "error"
                ? "border-red-800 bg-red-950/90 text-red-300"
                : "border-zinc-700 bg-zinc-900/90 text-zinc-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-zinc-500 hover:text-zinc-300 text-xs">
                ✕
              </button>
            </div>
            {t.txHash && (
              <a
                href={`https://explorer.test.mezo.org/tx/${t.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#F7931A] hover:underline mt-1 block"
              >
                View on Explorer →
              </a>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
