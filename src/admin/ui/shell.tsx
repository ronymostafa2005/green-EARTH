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
      { href: '#banner', icon: 'megaphone', label: 'banner', soon: true },
      { href: '#welcome', icon: 'hand', label: 'welcome', soon: true },
      { href: '#about', icon: 'fileText', label: 'about', soon: true },
      { href: '#quality', icon: 'shield', label: 'quality', soon: true },
      { href: '#export', icon: 'factory', label: 'export', soon: true },
      { href: '#social', icon: 'share', label: 'social', soon: true },
      { href: '#seo', icon: 'globe', label: 'seo', soon: true },
    ],
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useAdmin();
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 pt-6 pb-5">
        <span className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-stone-200 dark:ring-white/10">
          <Image src="/images/logo.png" alt="" width={34} height={34} />
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tracking-tight">Demeter</span>
          <span className="block text-xs text-stone-500 dark:text-stone-400">{t.appName}</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Admin">
        {navGroups.map((group, index) => (
          <div key={group.label ?? index} className="mt-5 first:mt-1">
            {group.label && (
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
                {t.nav[group.label]}
              </p>
            )}
            <ul className="grid gap-0.5">
              {group.items.map((item) =>
                item.soon ? (
                  <li key={item.href}>
                    <span
                      aria-disabled
                      title={t.soon.text}
                      className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-400 dark:text-stone-500"
                    >
                      <AdminIcon name={item.icon} />
                      <span className="flex-1">{t.nav[item.label]}</span>
                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold dark:bg-white/5">{t.common.soon}</span>
                    </span>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        isActive(item.href)
                          ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500/15 dark:text-brand-300'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-white',
                      )}
                    >
                      <AdminIcon name={item.icon} />
                      {t.nav[item.label]}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-stone-200/70 p-3 dark:border-white/5">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <AdminIcon name="external" />
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
    <div className="flex items-center gap-3 border-s border-stone-200 ps-3 dark:border-white/10">
      <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-brand-100 text-sm font-bold text-brand-800 uppercase dark:bg-brand-500/20 dark:text-brand-200">
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
    <div className="lg:ps-64">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-stone-200/70 bg-white lg:block dark:border-white/5 dark:bg-stone-900">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label={t.nav.closeMenu} onClick={() => setOpen(false)} className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 start-0 w-72 max-w-[85%] animate-fade-in bg-white shadow-2xl dark:bg-stone-900">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-stone-200/70 bg-stone-100/80 px-4 backdrop-blur-xl sm:px-8 dark:border-white/5 dark:bg-stone-950/80">
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
