'use client';

import { startTransition, useActionState, useState } from 'react';
import { cn } from '@/lib/utils';
import { signIn, type ActionResult } from '../actions';
import { adminButton, Field, inputStyles, Spinner } from './controls';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

const initial: ActionResult = { ok: true };

export function LoginForm({ next, notice, noticeIsError }: { next?: string; notice?: string; noticeIsError?: boolean }) {
  const { t } = useAdmin();
  const [state, action, pending] = useActionState(signIn, initial);
  const [showPassword, setShowPassword] = useState(false);
  const error = state.ok ? undefined : state.message;
  const banner = error ?? notice;

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
          role={error || noticeIsError ? 'alert' : 'status'}
          className={cn(
            'flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm',
            error || noticeIsError
              ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
              : 'bg-brand-50 text-brand-800 dark:bg-brand-500/10 dark:text-brand-200',
          )}
        >
          <AdminIcon name={error || noticeIsError ? 'alert' : 'checkCircle'} className="mt-px" />
          {banner}
        </p>
      )}

      <Field label={t.auth.email}>
        <div className="relative">
          <AdminIcon name="mail" className="pointer-events-none absolute inset-y-0 start-3.5 my-auto text-stone-400" />
          <input name="email" type="email" required autoComplete="username" dir="ltr" className={cn(inputStyles, 'h-12 ps-11')} />
        </div>
      </Field>

      <Field label={t.auth.password}>
        <div className="relative">
          <AdminIcon name="lock" className="pointer-events-none absolute inset-y-0 start-3.5 my-auto text-stone-400" />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            dir="ltr"
            className={cn(inputStyles, 'h-12 ps-11 pe-12')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.auth.hide : t.auth.show}
            className="absolute inset-y-0 end-1.5 my-auto grid size-9 place-items-center rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <AdminIcon name={showPassword ? 'eyeOff' : 'eye'} />
          </button>
        </div>
      </Field>

      <label className="flex items-center gap-2.5 text-sm text-stone-600 dark:text-stone-300">
        <input type="checkbox" name="remember" defaultChecked className="size-4 rounded accent-brand-600" />
        {t.auth.remember}
      </label>

      <button type="submit" disabled={pending} className={adminButton({ size: 'lg', className: 'mt-1 w-full' })}>
        {pending && <Spinner />}
        {pending ? t.auth.signingIn : t.auth.signIn}
      </button>
    </form>
  );
}
