'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { mainNav } from '@/config/site';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="relative mx-auto max-w-7xl">
        <div className="flex h-[68px] items-center justify-between rounded-full border border-ink/5 bg-white/85 pr-2.5 pl-2.5 shadow-[0_12px_40px_-18px_rgb(23_32_15/0.3)] backdrop-blur-xl sm:pl-3">
          <Logo />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-ink/65 hover:text-ink',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/contact" size="sm" className="max-sm:hidden">
              Get a quote
              <Icon name="arrow" />
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid size-11 place-items-center rounded-full bg-cream text-ink transition-colors hover:bg-brand-50 xl:hidden"
            >
              <Icon name={open ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={cn(
            'absolute inset-x-0 top-full mt-2 origin-top rounded-3xl border border-ink/5 bg-white p-3 shadow-2xl transition duration-200 xl:hidden',
            open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
          )}
        >
          <ul>
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3.5 font-medium transition-colors',
                    isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-cream',
                  )}
                >
                  {link.label}
                  <Icon name="arrow" size={16} className="opacity-40" />
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/contact" className="mt-2 w-full">
            Get a quote
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
