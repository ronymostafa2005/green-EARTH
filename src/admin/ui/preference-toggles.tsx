'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setPreference } from '../actions';
import { adminButton } from './controls';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

export function PreferenceToggles() {
  const { locale, theme, t } = useAdmin();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (name: 'locale' | 'theme', value: string) =>
    startTransition(async () => {
      await setPreference(name, value);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-1" aria-busy={pending}>
      <button
        type="button"
        onClick={() => change('locale', locale === 'ar' ? 'en' : 'ar')}
        aria-label={t.prefs.languageLabel}
        title={t.prefs.languageLabel}
        className={adminButton({ variant: 'ghost', size: 'sm' })}
      >
        <AdminIcon name="languages" />
        <span className="hidden sm:inline">{t.prefs.language}</span>
      </button>
      <button
        type="button"
        onClick={() => change('theme', theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? t.prefs.light : t.prefs.dark}
        title={theme === 'dark' ? t.prefs.light : t.prefs.dark}
        className={adminButton({ variant: 'ghost', size: 'icon' })}
      >
        <AdminIcon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </div>
  );
}
