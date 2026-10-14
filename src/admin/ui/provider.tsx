'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dictionaries, type Locale, type Theme } from '../i18n';
import { AdminIcon } from './icon';

type Toast = { id: number; ok: boolean; message: string };

type AdminContextValue = {
  locale: Locale;
  theme: Theme;
  t: (typeof dictionaries)[Locale];
  toast: (ok: boolean, message?: string) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin must be used inside AdminProvider');
  return value;
}

export function AdminProvider({ locale, theme, children }: { locale: Locale; theme: Theme; children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const t = dictionaries[locale];

  const toast = useCallback(
    (ok: boolean, message?: string) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, ok, message: message ?? (ok ? t.common.saved : t.common.error) }]);
      setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), ok ? 3200 : 6000);
    },
    [t],
  );

  const value = useMemo(() => ({ locale, theme, t, toast }), [locale, theme, t, toast]);

  return (
    <AdminContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-5 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.ok ? 'status' : 'alert'}
            className={cn(
              'pointer-events-auto flex max-w-md animate-toast-in items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_18px_40px_-16px_rgb(0_0_0/0.35)] ring-1',
              item.ok
                ? 'bg-white text-stone-800 ring-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:ring-white/10'
                : 'bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-100 dark:ring-red-900',
            )}
          >
            <AdminIcon name={item.ok ? 'checkCircle' : 'alert'} className={item.ok ? 'mt-px text-brand-500' : 'mt-px'} />
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
}
