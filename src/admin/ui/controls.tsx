'use client';

import { startTransition, useActionState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AdminIcon, type AdminIconName } from './icon';
import { useAdmin } from './provider';
import { adminButton, inputStyles, surface } from './styles';

export { adminButton, inputStyles, surface };

export function Spinner({ className }: { className?: string }) {
  return <AdminIcon name="spinner" className={cn('animate-spin', className)} />;
}

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('grid content-start gap-1.5', className)}>
      <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-stone-500 dark:text-stone-400">{hint}</span>}
    </label>
  );
}

export function Switch({ name, label, defaultChecked }: { name: string; label: React.ReactNode; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200/90 bg-[#fbfcf9] px-3.5 py-2.5 dark:border-white/10 dark:bg-[#1d211a]">
      <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{label}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25 after:absolute after:top-0.5 after:start-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 dark:bg-white/15"
      />
    </label>
  );
}

/** English + Arabic inputs for a field that has a `…Localization` twin. */
export function BilingualField({
  name,
  label,
  multiline,
  required,
  defaultValues,
  rows = 4,
  hint,
}: {
  name: string;
  label: string;
  multiline?: boolean;
  required?: boolean;
  defaultValues?: { en?: string | null; ar?: string | null };
  rows?: number;
  hint?: React.ReactNode;
}) {
  const { t } = useAdmin();
  const Input = multiline ? 'textarea' : 'input';
  const extra = multiline ? { rows, className: cn(inputStyles, 'resize-y leading-relaxed') } : { className: inputStyles };

  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">{label}</legend>
      <Field label={`${label} · ${t.common.english}`} required={required}>
        <Input name={name} dir="ltr" lang="en" required={required} defaultValue={defaultValues?.en ?? ''} {...extra} />
      </Field>
      <Field label={`${label} · ${t.common.arabic}`}>
        <Input name={`${name}Localization`} dir="rtl" lang="ar" defaultValue={defaultValues?.ar ?? ''} {...extra} />
      </Field>
      {hint && <p className="-mt-1 text-xs text-stone-500 sm:col-span-2 dark:text-stone-400">{hint}</p>}
    </fieldset>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useAdmin();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        'm-auto w-[calc(100%-2rem)] overflow-hidden rounded-3xl bg-white p-0 text-stone-900 shadow-2xl ring-1 ring-brand-950/10 backdrop:bg-brand-950/40 backdrop:backdrop-blur-sm open:animate-fade-in dark:bg-[#171a14] dark:text-stone-100 dark:ring-white/10',
        { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }[size],
      )}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-100 bg-white/90 px-6 py-5 backdrop-blur dark:border-white/5 dark:bg-[#171a14]/90">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label={t.common.close} className={adminButton({ variant: 'ghost', size: 'icon' })}>
              <AdminIcon name="x" />
            </button>
          </div>
          <div className="px-6 py-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  pending,
  title,
  text,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  title?: string;
  text?: string;
}) {
  const { t } = useAdmin();
  return (
    <Dialog open={open} onClose={onClose} title={title ?? t.common.confirmTitle} size="sm">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <AdminIcon name="trash" />
        </span>
        <p className="pt-2.5 text-sm text-stone-600 dark:text-stone-300">{text ?? t.common.confirmText}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={adminButton({ variant: 'secondary' })}>
          {t.common.cancel}
        </button>
        <button type="button" onClick={onConfirm} disabled={pending} className={adminButton({ variant: 'danger' })}>
          {pending && <Spinner />}
          {pending ? t.common.deleting : t.common.confirmDelete}
        </button>
      </div>
    </Dialog>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: AdminIconName; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-3xl border-2 border-dashed border-brand-900/10 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <AdminIcon name={icon} size={24} />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useAdmin();
  return (
    <div className="relative w-full sm:max-w-xs">
      <AdminIcon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto text-stone-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.common.search}
        aria-label={t.common.search}
        className={cn(inputStyles, 'ps-10')}
      />
    </div>
  );
}

type Result = { ok: boolean; message?: string; at?: number };

/** Runs a form action from onSubmit so React does not clear the fields when it fails. */
export function useFormSubmit(action: (prev: Result, data: FormData) => Promise<Result>, prepare?: (data: FormData) => void) {
  const [state, dispatch, pending] = useActionState(action, { ok: true });
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    prepare?.(data);
    startTransition(() => dispatch(data));
  };
  return [state, onSubmit, pending] as const;
}

/** Shows a toast whenever a server action returns a new result. */
export function useResultToast(result: { ok: boolean; message?: string; at?: number }, onSuccess?: () => void) {
  const { toast } = useAdmin();
  const last = useRef(result.at);
  useEffect(() => {
    if (!result.at || result.at === last.current) return;
    last.current = result.at;
    toast(result.ok, result.message);
    if (result.ok) onSuccess?.();
  }, [result, toast, onSuccess]);
}
