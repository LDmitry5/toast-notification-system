import { createContext, useCallback, useContext, useState, type FC, type ReactNode } from "react";
import type { Toast, ToastContextType } from "../types/types";
import { ToastItem } from "../components/ToastItem";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((prevToasts) => {
      const existingToast = prevToasts.find((t) => t.message === toast.message && t.type === toast.type);

      if (existingToast) {
        // Удаляем старый тост и создаём новый с тем же содержимым — это вызовет перемонтирование и сброс таймера
        const newId = Math.random().toString(36).substring(2, 9);
        return [
          ...prevToasts.filter((t) => t.id !== existingToast.id),
          {
            id: newId,
            ...toast,
            duration: toast.duration ?? 3000,
          },
        ];
      }

      // Создаём новый тост
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        ...toast,
        duration: toast.duration ?? 3000,
      };

      return [...prevToasts, newToast];
    });
  }, []);

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
