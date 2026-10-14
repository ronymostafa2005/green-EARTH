'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { deleteResource, saveResource } from '../actions';
import { resources, rowName, type ResourceKey, type Row } from '../resources';
import { adminButton, BilingualField, ConfirmDialog, Dialog, EmptyState, Field, inputStyles, SearchInput, Spinner, surface, Switch, useFormSubmit, useResultToast } from './controls';
import { AdminIcon } from './icon';
import { ImageInput } from './image-inputs';
import { useAdmin } from './provider';

export type ResourceRow = Row & { imageUrl?: string | null };

const str = (v: unknown) => (typeof v === 'string' ? v : '');

const platformNames: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};
const platformLabel = (value: string) => platformNames[value.toLowerCase()] ?? value;

function ResourceForm({ resourceKey, row, onDone }: { resourceKey: ResourceKey; row: ResourceRow | null; onDone: () => void }) {
  const { t } = useAdmin();
  const config = resources[resourceKey];
  const [state, onSubmit, pending] = useFormSubmit(saveResource.bind(null, resourceKey));
  useResultToast(state, onDone);

  const compact = config.fields.filter((f) => f.type === 'number' || f.type === 'boolean');

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {row && <input type="hidden" name="id" value={row.id} />}
      {config.fields.map((field) => {
        const label = t.fields[field.key];
        if (field.type === 'number' || field.type === 'boolean') return null;
        if (field.type === 'image') return <ImageInput key={field.key} name="image" label={label} currentUrl={row?.imageUrl} />;
        if (field.localized)
          return (
            <BilingualField
              key={field.key}
              name={field.key}
              label={label}
              multiline={field.type === 'textarea'}
              required={field.required}
              defaultValues={{ en: str(row?.[field.key]), ar: str(row?.[`${field.key}Localization`]) }}
            />
          );
        if (field.type === 'select')
          return (
            <Field key={field.key} label={label} required={field.required}>
              <select name={field.key} required={field.required} defaultValue={str(row?.[field.key]).toLowerCase()} className={inputStyles}>
                <option value="" disabled>
                  {t.fields.choose}
                </option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {platformLabel(option)}
                  </option>
                ))}
              </select>
            </Field>
          );
        return (
          <Field key={field.key} label={label} required={field.required} hint={field.key === 'link' ? t.fields.linkHint : undefined}>
            <input
              name={field.key}
              type={field.type === 'url' ? 'url' : 'text'}
              dir={field.type === 'url' || field.key === 'link' ? 'ltr' : undefined}
              defaultValue={str(row?.[field.key])}
              required={field.required}
              inputMode={field.key === 'year' ? 'numeric' : undefined}
              placeholder={field.type === 'url' ? 'https://' : undefined}
              className={inputStyles}
            />
          </Field>
        );
      })}
      {compact.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {compact.map((field) =>
            field.type === 'boolean' ? (
              <Switch key={field.key} name={field.key} label={t.fields[field.key]} defaultChecked={row ? row[field.key] !== false : true} />
            ) : (
              <Field key={field.key} label={t.fields[field.key]}>
                <input name={field.key} type="number" min={0} defaultValue={Number(row?.[field.key] ?? 0)} className={inputStyles} />
              </Field>
            ),
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 border-t border-stone-100 pt-5 dark:border-white/5">
        <button type="button" onClick={onDone} className={adminButton({ variant: 'secondary' })}>
          {t.common.cancel}
        </button>
        <button type="submit" disabled={pending} className={adminButton()}>
          {pending && <Spinner />}
          {pending ? t.common.saving : row ? t.common.save : t.common.create}
        </button>
      </div>
    </form>
  );
}

function RowActions({ categoryId, onEdit, onDelete }: { categoryId?: number; onEdit: () => void; onDelete: () => void }) {
  const { t } = useAdmin();
  return (
    <div className="flex items-center gap-1">
      {categoryId !== undefined && (
        <>
          <Link
            href={`/admin/products/new?category=${categoryId}`}
            className={adminButton({ variant: 'secondary', size: 'sm', className: 'max-sm:hidden' })}
          >
            <AdminIcon name="plus" size={15} />
            {t.products.addToCategory}
          </Link>
          <Link href={`/admin/products?category=${categoryId}`} className={adminButton({ variant: 'brandGhost', size: 'sm' })}>
            <AdminIcon name="box" size={15} />
            {t.products.viewProducts}
          </Link>
        </>
      )}
      <button type="button" onClick={onEdit} aria-label={t.common.edit} title={t.common.edit} className={adminButton({ variant: 'ghost', size: 'icon' })}>
        <AdminIcon name="pencil" size={16} />
      </button>
      <button type="button" onClick={onDelete} aria-label={t.common.delete} title={t.common.delete} className={adminButton({ variant: 'dangerGhost', size: 'icon' })}>
        <AdminIcon name="trash" size={16} />
      </button>
    </div>
  );
}

export function ResourceManager({ resourceKey, rows }: { resourceKey: ResourceKey; rows: ResourceRow[] }) {
  const { t, locale, toast } = useAdmin();
  const config = resources[resourceKey];
  const labels = t.resources[resourceKey];
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ResourceRow | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ResourceRow | null>(null);
  const [pending, startTransition] = useTransition();

  const titleKey = config.titleKey ?? 'name';
  const titleField = config.fields.find((f) => f.key === titleKey);
  const hasField = (key: string) => config.fields.some((f) => f.key === key);
  const title = (row: ResourceRow) => (titleField?.type === 'select' ? platformLabel(str(row[titleKey])) : rowName(row, locale, titleKey));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => Object.values(row).some((v) => typeof v === 'string' && v.toLowerCase().includes(q)));
  }, [rows, query]);

  const confirmDelete = () =>
    startTransition(async () => {
      if (!deleting) return;
      const result = await deleteResource(resourceKey, deleting.id);
      toast(result.ok, result.message);
      if (result.ok) setDeleting(null);
    });

  const addButton = (
    <button type="button" onClick={() => setEditing('new')} className={adminButton()}>
      <AdminIcon name="plus" />
      {t.common.add} {labels.singular}
    </button>
  );

  const localized = (row: ResourceRow, key: string) =>
    str(locale === 'ar' ? row[`${key}Localization`] || row[key] : row[key] || row[`${key}Localization`]);
  const subtitle = (row: ResourceRow) =>
    [str(row.location), str(row.year)].filter(Boolean).join(' · ') || localized(row, 'description') || localized(row, 'subtitle') || str(row.url);

  const statusBadge = (row: ResourceRow) =>
    hasField('isActive') && (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
          row.isActive === false
            ? 'bg-stone-100 text-stone-500 dark:bg-white/5 dark:text-stone-400'
            : 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
        )}
      >
        <span className={cn('size-1.5 rounded-full', row.isActive === false ? 'bg-stone-400' : 'bg-brand-500')} />
        {row.isActive === false ? t.fields.inactive : t.fields.active}
      </span>
    );

  return (
    <>
      <div className="mb-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} />
        {addButton}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="layers" title={t.common.emptyTitle} text={t.common.emptyText} action={addButton} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title={t.common.noResults} />
      ) : config.view === 'grid' ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <li key={row.id} className={cn('group overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:ring-brand-500/25', surface)}>
              <div className="relative m-2 mb-0 aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-brand-50 via-[#f6f4ec] to-sand-100/70 dark:from-white/[0.05] dark:via-white/[0.03] dark:to-white/[0.02]">
                {row.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.imageUrl}
                    alt=""
                    loading="lazy"
                    className="size-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-stone-300 dark:text-stone-600">
                    <AdminIcon name="image" size={32} />
                  </span>
                )}
                {hasField('isActive') && <span className="absolute start-3 top-3">{statusBadge(row)}</span>}
                {hasField('displayOrder') && (
                  <span className="absolute end-3 top-3 grid size-7 place-items-center rounded-full bg-white/90 text-xs font-bold text-stone-700 shadow-sm dark:bg-stone-900/90 dark:text-stone-200">
                    {Number(row.displayOrder ?? 0)}
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{title(row) || '—'}</h3>
                  {subtitle(row) && <p className="mt-0.5 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">{subtitle(row)}</p>}
                </div>
                <RowActions onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn('overflow-hidden rounded-3xl', surface)}>
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60 text-start text-xs font-semibold text-brand-900/60 dark:bg-white/[0.03] dark:text-stone-400">
              <tr>
                {titleField?.localized ? (
                  <>
                    <th className="px-5 py-3 text-start">{t.fields[titleKey]} · {t.common.english}</th>
                    <th className="px-5 py-3 text-start">{t.fields[titleKey]} · {t.common.arabic}</th>
                  </>
                ) : (
                  <th className="px-5 py-3 text-start">{t.fields[titleKey]}</th>
                )}
                {(hasField('description') || hasField('url')) && (
                  <th className="hidden px-5 py-3 text-start md:table-cell">{hasField('url') ? t.fields.url : t.fields.description}</th>
                )}
                {hasField('displayOrder') && <th className="px-5 py-3 text-start">{t.fields.displayOrder}</th>}
                {hasField('isActive') && <th className="px-5 py-3 text-start">{t.fields.status}</th>}
                <th className="px-5 py-3 text-end">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {filtered.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-brand-50/40 dark:hover:bg-white/[0.02]">
                  {titleField?.localized ? (
                    <>
                      <td className="px-5 py-3.5 font-medium" dir="ltr">
                        <span className={cn(locale === 'ar' && 'block text-end')}>{str(row[titleKey]) || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5" dir="rtl">
                        <span className={cn(locale === 'en' && 'block text-end')}>{str(row[`${titleKey}Localization`]) || '—'}</span>
                      </td>
                    </>
                  ) : (
                    <td className="px-5 py-3.5 font-medium">{title(row) || '—'}</td>
                  )}
                  {(hasField('description') || hasField('url')) && (
                    <td className="hidden max-w-sm truncate px-5 py-3.5 text-stone-500 md:table-cell dark:text-stone-400" dir={hasField('url') ? 'ltr' : undefined}>
                      {hasField('url') && str(row.url) ? (
                        <a href={str(row.url)} target="_blank" rel="noreferrer" className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">
                          {str(row.url)}
                        </a>
                      ) : (
                        subtitle(row) || '—'
                      )}
                    </td>
                  )}
                  {hasField('displayOrder') && <td className="px-5 py-3.5 tabular-nums">{Number(row.displayOrder ?? 0)}</td>}
                  {hasField('isActive') && <td className="px-5 py-3.5">{statusBadge(row)}</td>}
                  <td className="px-5 py-2">
                    <div className="flex justify-end">
                      <RowActions
                        categoryId={resourceKey === 'categories' ? row.id : undefined}
                        onEdit={() => setEditing(row)}
                        onDelete={() => setDeleting(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `${t.common.add} ${labels.singular}` : `${t.common.edit}: ${editing ? title(editing) : ''}`}
      >
        {editing !== null && (
          <ResourceForm key={editing === 'new' ? 'new' : editing.id} resourceKey={resourceKey} row={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
        )}
      </Dialog>

      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} />
    </>
  );
}
