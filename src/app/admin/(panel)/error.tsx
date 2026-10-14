'use client';

import { adminButton } from '@/admin/ui/controls';
import { AdminIcon } from '@/admin/ui/icon';
import { useAdmin } from '@/admin/ui/provider';

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useAdmin();
  return (
    <div className="grid place-items-center rounded-3xl bg-white px-6 py-20 text-center ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-white/[0.06]">
      <span className="grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AdminIcon name="alert" size={26} />
      </span>
      <h1 className="mt-5 text-lg font-semibold">{t.common.error}</h1>
      {error.message && <p className="mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">{error.message}</p>}
      <button type="button" onClick={reset} className={adminButton({ className: 'mt-6' })}>
        {t.common.retry}
      </button>
    </div>
  );
}
