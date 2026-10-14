'use client';

import { startTransition, useActionState, useState } from 'react';
import { cn } from '@/lib/utils';
import { signIn, type ActionResult } from '../actions';
import { Spinner } from './controls';
import { AdminIcon, type AdminIconName } from './icon';
import { useAdmin } from './provider';

const initial: ActionResult = { ok: true };

const fieldStyles =
  'h-12 w-full rounded-2xl border border-stone-200 bg-[#fbfcf9] ps-11 text-[15px] text-stone-900 outline-none transition duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-[#1d211a] dark:text-stone-50 dark:placeholder:text-stone-500 dark:hover:border-white/20 dark:focus:border-brand-400 dark:focus:bg-[#1d211a] dark:focus:ring-brand-400/15';

function InputShell({ id, label, icon, children }: { id: string; label: string; icon: AdminIconName; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-stone-700 dark:text-stone-200">
        {label}
      </label>
      <div dir="ltr" className="group relative">
        {children}
        <AdminIcon
          name={icon}
          className="pointer-events-none absolute inset-y-0 start-4 my-auto text-stone-400 transition-colors group-focus-within:text-brand-600 dark:text-stone-500 dark:group-focus-within:text-brand-400"
        />
      </div>
    </div>
  );
}

export function LoginForm({ next, notice, noticeIsError }: { next?: string; notice?: string; noticeIsError?: boolean }) {
  const { t } = useAdmin();
  const [state, action, pending] = useActionState(signIn, initial);
  const [showPassword, setShowPassword] = useState(false);
  const error = state.ok ? undefined : state.message;
  const banner = error ?? notice;
  const isError = !!error || !!noticeIsError;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 grid gap-5"
    >
      {next && <input type="hidden" name="next" value={next} />}

      {banner && (
        <p
          key={state.at ?? 'notice'}
          role={isError ? 'alert' : 'status'}
          className={cn(
            'flex animate-fade-up items-start gap-2.5 rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1',
            isError
              ? 'bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/20'
              : 'bg-brand-50 text-brand-800 ring-brand-200/70 dark:bg-brand-500/10 dark:text-brand-100 dark:ring-brand-400/20',
          )}
        >
          <AdminIcon name={isError ? 'alert' : 'checkCircle'} className="mt-0.5 shrink-0" />
          {banner}
        </p>
      )}

      <InputShell id="login-email" label={t.auth.email} icon="mail">
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          dir="ltr"
          placeholder={t.auth.emailPlaceholder}
          className={cn(fieldStyles, 'pe-4')}
        />
      </InputShell>

      <InputShell id="login-password" label={t.auth.password} icon="lock">
        <input
          id="login-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          dir="ltr"
          placeholder={t.auth.passwordPlaceholder}
          className={cn(fieldStyles, 'pe-12')}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? t.auth.hide : t.auth.show}
          className="absolute inset-y-0 end-1.5 my-auto grid size-9 place-items-center rounded-xl text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-200"
        >
          <AdminIcon name={showPassword ? 'eyeOff' : 'eye'} />
        </button>
      </InputShell>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-stone-600 select-none dark:text-stone-300">
        <input type="checkbox" name="remember" defaultChecked className="peer sr-only" />
        <span
          aria-hidden
          className="grid size-5 place-items-center rounded-md border border-stone-300 bg-white text-transparent transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25 dark:border-white/20 dark:bg-[#1d211a] dark:peer-checked:border-brand-500 dark:peer-checked:bg-brand-500 dark:peer-checked:text-brand-950"
        >
          <AdminIcon name="check" size={13} />
        </span>
        {t.auth.remember}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="group relative mt-1 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgb(75_111_39/0.8)] ring-1 ring-brand-700/50 transition duration-200 ring-inset hover:-translate-y-px hover:shadow-[0_14px_30px_-10px_rgb(75_111_39/0.9)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-70 dark:from-brand-400 dark:to-brand-600 dark:text-brand-950 dark:ring-brand-300/30"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 -start-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-[inset-inline-start] duration-700 group-hover:start-full"
        />
        {pending && <Spinner />}
        {pending ? t.auth.signingIn : t.auth.signIn}
        {!pending && <AdminIcon name="chevron" size={16} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />}
      </button>
    </form>
  );
}
