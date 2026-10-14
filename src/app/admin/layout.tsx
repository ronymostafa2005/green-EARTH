import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { getPrefs } from '@/admin/session';
import { AdminProvider } from '@/admin/ui/provider';
import { cn } from '@/lib/utils';

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | GDE Admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { locale, theme } = await getPrefs();

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      lang={locale}
      style={{ colorScheme: theme }}
      className={cn(
        arabic.variable,
        theme === 'dark' && 'dark',
        locale === 'ar' && 'font-[family-name:var(--font-arabic)]',
        'min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100',
      )}
    >
      <AdminProvider locale={locale} theme={theme}>
        {children}
      </AdminProvider>
    </div>
  );
}
