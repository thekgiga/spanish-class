import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast Notification System (T132)
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const ToastContext = React.createContext<{
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const styles = {
            success: "bg-green-50 border-green-200 text-green-800",
            error: "bg-red-50 border-red-200 text-red-800",
            info: "bg-blue-50 border-blue-200 text-blue-800",
            warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
          };
          return (
            <div key={toast.id} className={cn("p-4 rounded-lg border shadow-lg", styles[toast.type])}>
              <div className="flex items-start gap-3">
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
