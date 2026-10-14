'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { deleteProduct } from '../actions';
import type { Option } from '../products';
import { adminButton, ConfirmDialog, EmptyState, SearchInput, surface } from './controls';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

type ProductRow = {
  id: number;
  name: string;
  nameLocalization: string | null;
  categoryId: number;
  categoryName: string | null;
  thumbnail: string | null;
  imageCount: number;
  slug: string;
};

export function ProductsTable({ products, categories, created }: { products: ProductRow[]; categories: Option[]; created: boolean }) {
  const { t, locale, toast } = useAdmin();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<number | 'all'>('all');
  const [deleting, setDeleting] = useState<ProductRow | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!created) return;
    toast(true, t.common.created);
    router.replace('/admin/products', { scroll: false });
  }, [created, router, t, toast]);

  const categoryLabel = (row: ProductRow) => {
    const option = categories.find((c) => c.id === row.categoryId);
    return option ? (locale === 'ar' ? option.labelAr : option.label) : (row.categoryName ?? '—');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'all' || p.categoryId === category) &&
        (!q || p.name.toLowerCase().includes(q) || (p.nameLocalization ?? '').toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const confirmDelete = () =>
    startTransition(async () => {
      if (!deleting) return;
      const result = await deleteProduct(deleting.id);
      toast(result.ok, result.message);
      if (result.ok) setDeleting(null);
    });

  const filters = [{ id: 'all' as const, label: t.common.all }, ...categories.map((c) => ({ id: c.id, label: locale === 'ar' ? c.labelAr : c.label }))];

  if (products.length === 0) {
    return (
      <EmptyState
        icon="box"
        title={t.common.emptyTitle}
        text={t.common.emptyText}
        action={
          <Link href="/admin/products/new" className={adminButton()}>
            <AdminIcon name="plus" />
            {t.products.new}
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={query} onChange={setQuery} />
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
          <div role="tablist" className={cn('inline-flex gap-1 rounded-2xl p-1.5', surface)}>
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={category === f.id}
                onClick={() => setCategory(f.id)}
                className={cn(
                  'rounded-xl px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors',
                  category === f.id
                    ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500 dark:text-brand-950'
                    : 'text-stone-500 hover:bg-brand-50 hover:text-brand-800 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title={t.common.noResults} />
      ) : (
        <ul className="grid gap-3">
          {filtered.map((p) => (
            <li
              key={p.id}
              className={cn('flex items-center gap-4 rounded-2xl p-3 pe-4 transition hover:-translate-y-px hover:ring-brand-500/30 dark:hover:ring-white/15', surface)}
            >
              <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-sand-100/70 dark:from-white/5 dark:to-white/[0.02]">
                  {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnail} alt="" loading="lazy" className="size-full object-contain p-1.5" />
                  ) : (
                    <span className="grid size-full place-items-center text-stone-300 dark:text-stone-600">
                      <AdminIcon name="image" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{locale === 'ar' ? p.nameLocalization || p.name : p.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {categoryLabel(p)}
                    </span>
                    <span className="flex items-center gap-1">
                      <AdminIcon name="image" size={13} />
                      {p.imageCount} {t.products.imagesCount}
                    </span>
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-1">
                <a
                  href={`/products/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t.products.viewOnSite}
                  title={t.products.viewOnSite}
                  className={adminButton({ variant: 'ghost', size: 'icon', className: 'max-sm:hidden' })}
                >
                  <AdminIcon name="external" size={16} />
                </a>
                <Link href={`/admin/products/${p.id}`} aria-label={t.common.edit} title={t.common.edit} className={adminButton({ variant: 'ghost', size: 'icon' })}>
                  <AdminIcon name="pencil" size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleting(p)}
                  aria-label={t.common.delete}
                  title={t.common.delete}
                  className={adminButton({ variant: 'dangerGhost', size: 'icon' })}
                >
                  <AdminIcon name="trash" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} />
    </>
  );
}
