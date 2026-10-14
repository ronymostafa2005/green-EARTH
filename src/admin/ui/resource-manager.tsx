'use client';

import { useMemo, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { deleteResource, saveResource } from '../actions';
import { resources, rowName, type ResourceKey, type Row } from '../resources';
import { adminButton, BilingualField, ConfirmDialog, Dialog, EmptyState, Field, inputStyles, SearchInput, Spinner, useFormSubmit, useResultToast } from './controls';
import { AdminIcon } from './icon';
import { ImageInput } from './image-inputs';
import { useAdmin } from './provider';

export type ResourceRow = Row & { imageUrl?: string | null };

const str = (v: unknown) => (typeof v === 'string' ? v : '');

function ResourceForm({ resourceKey, row, onDone }: { resourceKey: ResourceKey; row: ResourceRow | null; onDone: () => void }) {
  const { t } = useAdmin();
  const config = resources[resourceKey];
  const [state, onSubmit, pending] = useFormSubmit(saveResource.bind(null, resourceKey));
  useResultToast(state, onDone);

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {row && <input type="hidden" name="id" value={row.id} />}
      {config.fields.map((field) => {
        const label = t.fields[field.key];
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
        return (
          <Field key={field.key} label={label} required={field.required}>
            <input
              name={field.key}
              defaultValue={str(row?.[field.key])}
              required={field.required}
              inputMode={field.key === 'year' ? 'numeric' : undefined}
              className={inputStyles}
            />
          </Field>
        );
      })}
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

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const { t } = useAdmin();
  return (
    <div className="flex items-center gap-1">
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.nameLocalization, row.location, row.year, row.description].some((v) => str(v).toLowerCase().includes(q)),
    );
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

  const subtitle = (row: ResourceRow) =>
    [str(row.location), str(row.year)].filter(Boolean).join(' · ') ||
    str(locale === 'ar' ? row.descriptionLocalization || row.description : row.description || row.descriptionLocalization);

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
            <li key={row.id} className="group overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200/70 transition hover:shadow-[0_20px_40px_-24px_rgb(0_0_0/0.3)] dark:bg-stone-900 dark:ring-white/[0.06]">
              <div className="relative aspect-[16/10] bg-stone-50 dark:bg-white/[0.03]">
                {row.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.imageUrl} alt="" loading="lazy" className="size-full object-contain p-6" />
                ) : (
                  <span className="grid size-full place-items-center text-stone-300 dark:text-stone-600">
                    <AdminIcon name="image" size={32} />
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{rowName(row, locale)}</h3>
                  {subtitle(row) && <p className="mt-0.5 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">{subtitle(row)}</p>}
                </div>
                <RowActions onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-start text-xs font-semibold text-stone-500 dark:bg-white/[0.03] dark:text-stone-400">
              <tr>
                <th className="px-5 py-3 text-start">{t.fields.name} · {t.common.english}</th>
                <th className="px-5 py-3 text-start">{t.fields.name} · {t.common.arabic}</th>
                {config.fields.some((f) => f.key === 'description') && <th className="hidden px-5 py-3 text-start md:table-cell">{t.fields.description}</th>}
                <th className="w-24 px-5 py-3 text-end">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {filtered.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-stone-50/70 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium" dir="ltr">
                    <span className={cn(locale === 'ar' && 'block text-end')}>{str(row.name) || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5" dir="rtl">
                    <span className={cn(locale === 'en' && 'block text-end')}>{str(row.nameLocalization) || '—'}</span>
                  </td>
                  {config.fields.some((f) => f.key === 'description') && (
                    <td className="hidden max-w-sm truncate px-5 py-3.5 text-stone-500 md:table-cell dark:text-stone-400">{subtitle(row) || '—'}</td>
                  )}
                  <td className="px-5 py-2">
                    <div className="flex justify-end">
                      <RowActions onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
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
        title={editing === 'new' ? `${t.common.add} ${labels.singular}` : `${t.common.edit}: ${editing ? rowName(editing, locale) : ''}`}
      >
        {editing !== null && (
          <ResourceForm key={editing === 'new' ? 'new' : editing.id} resourceKey={resourceKey} row={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
        )}
      </Dialog>

      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} />
    </>
  );
}
