import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import { countOf, listPage } from '@/admin/api';
import { formatDate, toMessage } from '@/admin/messages';
import { getDictionary, getPrefs, getUser } from '@/admin/session';
import { AdminIcon, type AdminIconName } from '@/admin/ui/icon';
import { Card, CardTitle, PageHeader } from '@/admin/ui/page-header';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).nav.overview };
}

const settled = async <T,>(promise: Promise<T>) => {
  try {
    return await promise;
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
};

export default async function OverviewPage() {
  const [t, { locale }, user] = await Promise.all([getDictionary(), getPrefs(), getUser()]);

  const [products, categories, certifications, exhibitions, messages] = await Promise.all([
    settled(countOf('Product')),
    settled(countOf('ProductCategory')),
    settled(countOf('Certification')),
    settled(countOf('Exhibition')),
    settled(listPage('ContactUs', { pageNumber: 1, pageSize: 5 })),
  ]);

  const stats: { label: string; value: number | null; href: string; icon: AdminIconName }[] = [
    { label: t.nav.products, value: products, href: '/admin/products', icon: 'box' },
    { label: t.nav.categories, value: categories, href: '/admin/categories', icon: 'tag' },
    { label: t.nav.certifications, value: certifications, href: '/admin/certifications', icon: 'award' },
    { label: t.nav.exhibitions, value: exhibitions, href: '/admin/exhibitions', icon: 'calendar' },
    { label: t.nav.messages, value: messages?.totalCount ?? null, href: '/admin/messages', icon: 'inbox' },
  ];

  const quickActions: { label: string; href: string; icon: AdminIconName }[] = [
    { label: t.overview.addProduct, href: '/admin/products/new', icon: 'box' },
    { label: t.overview.addCertification, href: '/admin/certifications', icon: 'award' },
    { label: t.overview.addExhibition, href: '/admin/exhibitions', icon: 'calendar' },
  ];

  const recent = (messages?.data ?? []).map(toMessage);

  return (
    <>
      <PageHeader title={user?.name ? `${t.overview.greeting}${locale === 'ar' ? '، ' : ', '}${user.name}` : t.overview.greeting} description={t.overview.subtitle} />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.href}>
            <Link
              href={stat.href}
              className="group flex h-full flex-col justify-between gap-6 rounded-3xl bg-white p-5 ring-1 ring-stone-200/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgb(0_0_0/0.3)] dark:bg-stone-900 dark:ring-white/[0.06]"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
                <AdminIcon name={stat.icon} size={20} />
              </span>
              <span>
                <span className="block text-3xl font-bold tracking-tight tabular-nums">{stat.value ?? '—'}</span>
                <span className="mt-1 block text-sm text-stone-500 dark:text-stone-400">{stat.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle
            title={t.overview.recentMessages}
            action={
              <Link href="/admin/messages" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                {t.overview.viewAll}
              </Link>
            }
          />
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">{t.messages.empty}</p>
          ) : (
            <ul className="-mx-2 divide-y divide-stone-100 dark:divide-white/5">
              {recent.map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-2 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 uppercase dark:bg-brand-500/15 dark:text-brand-200">
                    {(m.name || m.email).charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold">{m.name || m.email}</span>
                      {formatDate(m.date, locale) && <span className="shrink-0 text-xs text-stone-400">{formatDate(m.date, locale)}</span>}
                    </p>
                    <p className="truncate text-sm text-stone-500 dark:text-stone-400">{m.subject || m.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle title={t.overview.quickActions} />
          <ul className="grid gap-2">
            {quickActions.map((action) => (
              <li key={action.label}>
                <Link
                  href={action.href}
                  className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-stone-200/70 transition hover:bg-stone-50 hover:ring-stone-300 dark:ring-white/[0.06] dark:hover:bg-white/[0.03]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-stone-100 text-stone-700 dark:bg-white/5 dark:text-stone-300">
                    <AdminIcon name={action.icon} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{action.label}</span>
                  <AdminIcon name="plus" size={16} className="text-stone-400" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
