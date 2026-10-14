import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import { adminRequest, countOf, listPage } from '@/admin/api';
import { formatDate, toMessage } from '@/admin/messages';
import { getDictionary, getPrefs, getUser } from '@/admin/session';
import { AdminIcon, type AdminIconName } from '@/admin/ui/icon';
import { Card, CardTitle } from '@/admin/ui/page-header';
import { adminButton, surface } from '@/admin/ui/styles';
import { cn } from '@/lib/utils';

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

const tones = {
  green: { icon: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300', glow: 'bg-brand-400' },
  amber: { icon: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', glow: 'bg-amber-400' },
  sky: { icon: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300', glow: 'bg-sky-400' },
  violet: { icon: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300', glow: 'bg-violet-400' },
  rose: { icon: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300', glow: 'bg-rose-400' },
};

/** Reads a count from the Dashboard/Stats payload, whose exact keys the API does not document. */
function pickStat(stats: unknown, include: RegExp, exclude?: RegExp) {
  if (!stats || typeof stats !== 'object') return null;
  const entry = Object.entries(stats).find(([key, value]) => typeof value === 'number' && include.test(key) && !exclude?.test(key));
  return entry ? (entry[1] as number) : null;
}

export default async function OverviewPage() {
  const [t, { locale }, user, dashboard] = await Promise.all([getDictionary(), getPrefs(), getUser(), settled(adminRequest<unknown>('Dashboard/Stats'))]);

  const count = (endpoint: string, include: RegExp, exclude?: RegExp) => {
    const fromStats = pickStat(dashboard, include, exclude);
    return fromStats !== null ? Promise.resolve(fromStats) : settled(countOf(endpoint));
  };

  const [products, categories, certifications, exhibitions, messages, unread] = await Promise.all([
    count('Product', /product/i, /categor|image|type|variet/i),
    count('ProductCategory', /categor/i),
    count('Certification', /certif/i),
    count('Exhibition', /exhibit/i),
    settled(listPage('ContactUs', { pageNumber: 1, pageSize: 5 })),
    pickStat(dashboard, /unread/i) ?? settled(listPage('ContactUs', { pageNumber: 1, pageSize: 1, isRead: false }).then((r) => r?.totalCount ?? 0)),
  ]);

  const stats: { label: string; value: number | null; hint?: string; href: string; icon: AdminIconName; tone: keyof typeof tones }[] = [
    { label: t.nav.products, value: products, href: '/admin/products', icon: 'box', tone: 'green' },
    { label: t.nav.categories, value: categories, href: '/admin/categories', icon: 'tag', tone: 'amber' },
    { label: t.nav.certifications, value: certifications, href: '/admin/certifications', icon: 'award', tone: 'sky' },
    { label: t.nav.exhibitions, value: exhibitions, href: '/admin/exhibitions', icon: 'calendar', tone: 'violet' },
    {
      label: t.nav.messages,
      value: messages?.totalCount ?? pickStat(dashboard, /message|contact/i, /unread/i),
      hint: unread ? `${unread} ${t.messages.unread}` : undefined,
      href: unread ? '/admin/messages?filter=unread' : '/admin/messages',
      icon: 'inbox',
      tone: 'rose',
    },
  ];

  const quickActions: { label: string; href: string; icon: AdminIconName; tone: keyof typeof tones }[] = [
    { label: t.overview.addProduct, href: '/admin/products/new', icon: 'box', tone: 'green' },
    { label: t.overview.addCertification, href: '/admin/certifications', icon: 'award', tone: 'sky' },
    { label: t.overview.addExhibition, href: '/admin/exhibitions', icon: 'calendar', tone: 'violet' },
    { label: t.nav.banner, href: '/admin/banners', icon: 'megaphone', tone: 'amber' },
    { label: t.nav.settings, href: '/admin/settings', icon: 'settings', tone: 'rose' },
  ];

  const recent = (messages?.data ?? []).map(toMessage);
  const today = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const greeting = user?.name ? `${t.overview.greeting}${locale === 'ar' ? '، ' : ', '}${user.name}` : t.overview.greeting;

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-brand-950 px-6 py-9 text-white shadow-[0_24px_60px_-28px_rgb(19_33_13/0.7)] sm:px-10 sm:py-11">
        <Image src="/images/pages/header.jpg" alt="" fill priority sizes="(min-width: 1024px) 75vw, 100vw" className="-z-20 object-cover opacity-45" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950 via-brand-950/80 to-brand-950/10 rtl:bg-gradient-to-l" />
        <p className="flex items-center gap-2 text-sm text-brand-200">
          <AdminIcon name="leaf" size={16} />
          {today}
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{greeting}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">{t.overview.subtitle}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/admin/products/new" className={adminButton({ className: 'bg-white text-brand-900 hover:bg-brand-50 dark:bg-white dark:text-brand-900 dark:hover:bg-brand-50' })}>
            <AdminIcon name="plus" />
            {t.overview.addProduct}
          </Link>
          <a href="/" target="_blank" rel="noreferrer" className={adminButton({ variant: 'ghost', className: 'text-white ring-1 ring-white/25 hover:bg-white/10 dark:text-white' })}>
            <AdminIcon name="external" size={16} />
            {t.common.viewSite}
          </a>
        </div>
      </section>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.href}>
            <Link
              href={stat.href}
              className={cn('group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl p-5 transition duration-300 hover:-translate-y-1', surface)}
            >
              <span aria-hidden className={cn('absolute -end-8 -top-8 size-24 rounded-full opacity-[0.15] blur-2xl transition-opacity group-hover:opacity-30', tones[stat.tone].glow)} />
              <span className="flex items-center justify-between">
                <span className={cn('grid size-11 place-items-center rounded-2xl', tones[stat.tone].icon)}>
                  <AdminIcon name={stat.icon} size={20} />
                </span>
                <AdminIcon name="chevron" size={16} className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-stone-500 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 dark:text-stone-600" />
              </span>
              <span>
                <span className="block text-3xl font-bold tracking-tight text-brand-950 tabular-nums dark:text-white">{stat.value ?? '—'}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400">
                  {stat.label}
                  {stat.hint && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">{stat.hint}</span>
                  )}
                </span>
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
            <div className="grid place-items-center rounded-2xl bg-brand-50/50 py-10 text-center dark:bg-white/[0.02]">
              <span className={cn('grid size-12 place-items-center rounded-2xl', tones.rose.icon)}>
                <AdminIcon name="inbox" size={22} />
              </span>
              <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">{t.messages.empty}</p>
            </div>
          ) : (
            <ul className="-mx-2 grid gap-1">
              {recent.map((m) => (
                <li key={m.id}>
                  <Link href="/admin/messages" className="flex items-start gap-3 rounded-2xl px-2 py-3 transition hover:bg-brand-50/60 dark:hover:bg-white/[0.03]">
                    <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white uppercase">
                      {(m.name || m.email).charAt(0)}
                      {!m.isRead && <span className="absolute -end-0.5 -top-0.5 size-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#171a14]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={cn('truncate text-sm', m.isRead ? 'font-semibold' : 'font-bold')}>{m.name || m.email}</span>
                        {formatDate(m.date, locale) && <span className="shrink-0 text-xs text-stone-400">{formatDate(m.date, locale)}</span>}
                      </span>
                      <span className="block truncate text-sm text-stone-500 dark:text-stone-400">{m.subject || m.message}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle title={t.overview.quickActions} />
          <ul className="grid gap-2.5">
            {quickActions.map((action) => (
              <li key={action.label}>
                <Link
                  href={action.href}
                  className="group flex items-center gap-3 rounded-2xl bg-stone-50/80 p-3 ring-1 ring-transparent transition hover:bg-white hover:ring-brand-500/25 hover:shadow-sm dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <span className={cn('grid size-10 place-items-center rounded-xl', tones[action.tone].icon)}>
                    <AdminIcon name={action.icon} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{action.label}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-white text-stone-400 shadow-sm transition group-hover:bg-brand-600 group-hover:text-white dark:bg-white/5">
                    <AdminIcon name="plus" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
