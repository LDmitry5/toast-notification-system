import { createContext, useCallback, useContext, useState, type FC, type ReactNode } from "react";
import type { Toast, ToastContextType } from "../types/types";
import { ToastItem } from "../components/ToastItem";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const existingToast = toasts.find((t) => t.message === toast.message && t.type === toast.type);

      if (existingToast) {
        // Обновляем таймер существующего тоста
        setToasts((prev) =>
          prev.map((t) => (t.id === existingToast.id ? { ...t, duration: toast.duration ?? 3000 } : t)),
        );
        return;
      }

      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        ...toast,
        duration: toast.duration ?? 3000, // по умолчанию 3 секунды
      };

      setToasts((prev) => [...prev, newToast]);
    },
    [toasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-list">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
