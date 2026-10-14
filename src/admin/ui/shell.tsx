'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Dictionary } from '../i18n';
import type { AdminUser } from '../session';
import { adminButton } from './controls';
import { AdminIcon, type AdminIconName } from './icon';
import { PreferenceToggles } from './preference-toggles';
import { useAdmin } from './provider';

type NavItem = { href: string; icon: AdminIconName; label: keyof Dictionary['nav']; soon?: boolean };

const navGroups: { label?: keyof Dictionary['nav']; items: NavItem[] }[] = [
  { items: [{ href: '/admin', icon: 'dashboard', label: 'overview' }] },
  {
    label: 'catalog',
    items: [
      { href: '/admin/products', icon: 'box', label: 'products' },
      { href: '/admin/categories', icon: 'tag', label: 'categories' },
    ],
  },
  {
    label: 'attributes',
    items: [
      { href: '/admin/types', icon: 'layers', label: 'types' },
      { href: '/admin/packing-types', icon: 'archive', label: 'packingTypes' },
      { href: '/admin/vitamins', icon: 'pill', label: 'vitamins' },
      { href: '/admin/minerals', icon: 'gem', label: 'minerals' },
    ],
  },
  {
    label: 'company',
    items: [
      { href: '/admin/certifications', icon: 'award', label: 'certifications' },
      { href: '/admin/exhibitions', icon: 'calendar', label: 'exhibitions' },
    ],
  },
  { label: 'inbox', items: [{ href: '/admin/messages', icon: 'inbox', label: 'messages' }] },
  {
    label: 'siteContent',
    items: [
      { href: '/admin/banners', icon: 'megaphone', label: 'banner' },
      { href: '/admin/sections/welcome', icon: 'hand', label: 'welcome' },
      { href: '/admin/sections/about', icon: 'fileText', label: 'about' },
      { href: '/admin/sections/quality', icon: 'shield', label: 'quality' },
      { href: '/admin/sections/export', icon: 'factory', label: 'export' },
      { href: '/admin/social', icon: 'share', label: 'social' },
      { href: '/admin/seo', icon: 'globe', label: 'seo' },
      { href: '/admin/settings', icon: 'settings', label: 'settings' },
    ],
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useAdmin();
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#1d3013] via-brand-950 to-[#0c1508] text-white">
      <div aria-hidden className="pointer-events-none absolute -top-24 -end-24 size-64 rounded-full bg-brand-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -start-20 size-72 rounded-full bg-sand-400/10 blur-3xl" />

      <Link href="/admin" onClick={onNavigate} className="relative flex items-center gap-3 px-5 pt-6 pb-5">
        <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-lg shadow-black/20">
          <Image src="/images/logo.png" alt="" width={36} height={36} />
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tracking-tight">Demeter Green Earth</span>
          <span className="block text-xs text-brand-200/70">{t.appName}</span>
        </span>
      </Link>

      <nav className="relative flex-1 overflow-y-auto px-3 pb-6 [scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]" aria-label="Admin">
        {navGroups.map((group, index) => (
          <div key={group.label ?? index} className="mt-6 first:mt-1">
            {group.label && (
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-brand-200/45 uppercase">{t.nav[group.label]}</p>
            )}
            <ul className="grid gap-1">
              {group.items.map((item) =>
                item.soon ? (
                  <li key={item.href}>
                    <span
                      aria-disabled
                      title={t.soon.text}
                      className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/35"
                    >
                      <AdminIcon name={item.icon} />
                      <span className="flex-1">{t.nav[item.label]}</span>
                      <span className="rounded-full bg-sand-300/15 px-2 py-0.5 text-[10px] font-semibold text-sand-200">{t.common.soon}</span>
                    </span>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive(item.href)
                          ? 'bg-white text-brand-900 shadow-lg shadow-black/25'
                          : 'text-white/70 hover:bg-white/[0.07] hover:text-white',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-7 place-items-center rounded-lg transition-colors',
                          isActive(item.href) ? 'bg-brand-600 text-white' : 'bg-white/[0.06] text-brand-200',
                        )}
                      >
                        <AdminIcon name={item.icon} size={16} />
                      </span>
                      {t.nav[item.label]}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3 py-3 text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-brand-500 text-brand-950">
            <AdminIcon name="external" size={16} />
          </span>
          {t.common.viewSite}
        </a>
      </div>
    </div>
  );
}

function UserMenu({ user }: { user: AdminUser | null }) {
  const { t } = useAdmin();
  const name = user?.name ?? 'Admin';

  return (
    <div className="flex items-center gap-3 border-s border-stone-300/60 ps-3 dark:border-white/10">
      <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white uppercase shadow-sm ring-2 ring-white dark:ring-white/10">
        {name.charAt(0)}
      </span>
      <span className="hidden leading-tight md:block">
        <span className="block max-w-40 truncate text-sm font-semibold">{name}</span>
        {user?.email && <span className="block max-w-40 truncate text-xs text-stone-500 dark:text-stone-400">{user.email}</span>}
      </span>
      {/* Plain link: a prefetched <Link> would sign the user out. */}
      <a href="/admin/logout" aria-label={t.auth.logout} title={t.auth.logout} className={adminButton({ variant: 'ghost', size: 'icon' })}>
        <AdminIcon name="logout" className="rtl:-scale-x-100" />
      </a>
    </div>
  );
}

export function AdminShell({ user, children }: { user: AdminUser | null; children: React.ReactNode }) {
  const { t } = useAdmin();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative isolate lg:ps-[17rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_100%_at_70%_0%,rgb(130_174_70/0.18),transparent_70%),radial-gradient(40%_80%_at_10%_0%,rgb(212_174_127/0.16),transparent_70%)] dark:bg-[radial-gradient(60%_100%_at_70%_0%,rgb(130_174_70/0.10),transparent_70%)]"
      />

      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[17rem] p-3 lg:block">
        <div className="h-full overflow-hidden rounded-[1.75rem] shadow-[0_20px_50px_-20px_rgb(19_33_13/0.6)]">
          <Sidebar />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label={t.nav.closeMenu} onClick={() => setOpen(false)} className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 start-0 w-72 max-w-[85%] animate-fade-in shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-[#eef1e8]/75 px-4 backdrop-blur-xl sm:px-8 dark:bg-[#0d0f0b]/75">
        <button type="button" onClick={() => setOpen(true)} aria-label={t.nav.openMenu} className={adminButton({ variant: 'ghost', size: 'icon', className: 'lg:hidden' })}>
          <AdminIcon name="menu" />
        </button>
        <div className="flex-1" />
        <PreferenceToggles />
        <UserMenu user={user} />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
