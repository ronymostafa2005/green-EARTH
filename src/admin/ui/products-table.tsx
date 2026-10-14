'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { deleteProduct, setProductVisibility } from '../actions';
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
  visible: boolean;
};

function VisibilityToggle({ productId, initial }: { productId: number; initial: boolean }) {
  const { t, toast } = useAdmin();
  const [shown, setShown] = useState(initial);
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      setShown(!shown);
      const result = await setProductVisibility(productId, !shown);
      if (!result.ok) setShown(shown);
      toast(result.ok, result.ok ? (shown ? t.products.hiddenDone : t.products.shownDone) : result.message);
    });

  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          'inline-flex min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
          shown
            ? 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-400/25'
            : 'bg-stone-100 text-stone-600 ring-stone-300/60 dark:bg-white/5 dark:text-stone-400 dark:ring-white/10',
        )}
      >
        <span className={cn('size-2 shrink-0 rounded-full', shown ? 'animate-pulse bg-brand-500' : 'bg-stone-400 dark:bg-stone-500')} />
        {shown ? t.products.statusShown : t.products.statusHidden}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        title={shown ? t.products.shownHint : t.products.hiddenHint}
        className={cn(
          'inline-flex h-9 min-w-[6.5rem] cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold shadow-sm ring-1 transition-all duration-200 ring-inset hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70',
          shown
            ? 'bg-red-50 text-red-700 ring-red-400/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/30 dark:hover:bg-red-500/20'
            : 'bg-brand-600 text-white ring-brand-700/20 hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:ring-brand-400/30 dark:hover:bg-brand-400',
        )}
      >
        <AdminIcon name={shown ? 'eyeOff' : 'eye'} size={15} className={cn(pending && 'animate-pulse')} />
        {shown ? t.products.unShow : t.products.show}
      </button>
    </div>
  );
}

export function ProductsTable({
  products,
  categories,
  created,
  initialCategory,
}: {
  products: ProductRow[];
  categories: Option[];
  created: boolean;
  initialCategory: number | 'all';
}) {
  const { t, locale, toast } = useAdmin();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<number | 'all'>(initialCategory);
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
        <div className={cn('overflow-x-auto rounded-3xl xl:overflow-visible', surface)}>
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="text-xs font-semibold text-brand-900/70 dark:text-stone-400">
                {[
                  { label: t.products.product, className: 'ps-5 text-start' },
                  { label: t.fields.category, className: 'text-start' },
                  { label: t.fields.images, className: 'text-center max-lg:hidden' },
                  { label: t.products.visibility, className: 'text-center' },
                  { label: t.common.actions, className: 'pe-5 text-end' },
                ].map((column) => (
                  <th
                    key={column.label}
                    scope="col"
                    className={cn(
                      'border-b border-brand-900/[0.07] bg-brand-50/70 px-3 py-3.5 whitespace-nowrap first:rounded-ss-3xl last:rounded-se-3xl dark:border-white/5 dark:bg-white/[0.03]',
                      column.className,
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="group/row transition-colors hover:bg-brand-50/40 dark:hover:bg-white/[0.02]">
                  <td className="py-3 ps-5 pe-3">
                    <Link href={`/admin/products/${p.id}`} className="flex min-w-0 items-center gap-4">
                      <span className="relative z-0 size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-sand-100/70 ring-1 ring-brand-950/[0.05] transition-all duration-300 ease-out hover:z-20 hover:scale-[1.9] hover:bg-white hover:shadow-[0_18px_40px_-12px_rgb(19_33_13/0.45)] hover:ring-brand-950/10 ltr:origin-left rtl:origin-right dark:from-white/5 dark:to-white/[0.02] dark:ring-white/5 dark:hover:bg-stone-800">
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
                        <span className="block max-w-[16rem] truncate font-semibold text-stone-900 transition-colors group-hover/row:text-brand-700 dark:text-stone-100 dark:group-hover/row:text-brand-300">
                          {locale === 'ar' ? p.nameLocalization || p.name : p.name}
                        </span>
                        <span className="mt-0.5 block max-w-[16rem] truncate text-xs text-stone-400" dir={locale === 'ar' ? 'ltr' : 'rtl'}>
                          {locale === 'ar' ? (p.nameLocalization ? p.name : '') : p.nameLocalization}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-block rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {categoryLabel(p)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center max-lg:hidden">
                    <Link
                      href={`/admin/products/${p.id}#gallery`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-stone-600 tabular-nums transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-brand-300"
                    >
                      <AdminIcon name="image" size={15} />
                      {p.imageCount}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <VisibilityToggle productId={p.id} initial={p.visible} />
                  </td>
                  <td className="py-3 ps-3 pe-5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}#gallery`}
                        className={adminButton({ variant: 'secondary', size: 'sm', className: 'max-2xl:hidden' })}
                      >
                        <AdminIcon name="image" size={15} />
                        {t.products.gallery}
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}#types`}
                        className={adminButton({ variant: 'secondary', size: 'sm', className: 'me-1 max-2xl:hidden' })}
                      >
                        <AdminIcon name="layers" size={15} />
                        {t.products.types}
                      </Link>
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t.products.viewOnSite}
                        title={t.products.viewOnSite}
                        className={adminButton({ variant: 'ghost', size: 'icon' })}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} />
    </>
  );
}
