import { cookies } from 'next/headers';
import { dictionaries, isLocale, isTheme, type Locale, type Theme } from './i18n';

export const TOKEN_COOKIE = 'gde_admin_token';
export const USER_COOKIE = 'gde_admin_user';
export const LOCALE_COOKIE = 'gde_admin_lang';
export const THEME_COOKIE = 'gde_admin_theme';

export type AdminUser = { name: string; email: string; image?: string | null };

export async function getPrefs(): Promise<{ locale: Locale; theme: Theme }> {
  const store = await cookies();
  const locale = store.get(LOCALE_COOKIE)?.value;
  const theme = store.get(THEME_COOKIE)?.value;
  return { locale: isLocale(locale) ? locale : 'en', theme: isTheme(theme) ? theme : 'light' };
}

export async function getDictionary() {
  return dictionaries[(await getPrefs()).locale];
}

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

export async function getUser(): Promise<AdminUser | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
