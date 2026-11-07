import * as React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
};

type ToastContextType = {
  toasts: Toast[];
  add: (t: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const add = (t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  };
  const remove = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl border bg-white p-4 text-navy-900 shadow-lg dark:border-white/20 dark:bg-navy-800 dark:text-white',
              t.variant === 'error' && 'border-red-500',
              t.variant === 'success' && 'border-emerald-500'
            )}
          >
            {icons[t.variant ?? 'info']}
            <div>
              <h4 className="text-sm font-semibold">{t.title}</h4>
              {t.description && (
                <p className="text-xs text-muted-foreground dark:text-gray-400">{t.description}</p>
              )}
            </div>
            <button onClick={() => remove(t.id)} className="ml-auto opacity-50 hover:opacity-100">
              <span className="sr-only">Dismiss</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
