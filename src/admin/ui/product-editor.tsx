'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { addProductLink, addVariety, deleteProductImage, removeProductLink, removeVariety, toggleHarvestMonth, uploadProductImages, type ActionResult } from '../actions';
import type { LinkItem, MonthLink, Option } from '../products';
import { productLinks, type ProductLinkKind } from '../resources';
import { adminButton, ConfirmDialog, inputStyles, Spinner } from './controls';
import { AdminIcon } from './icon';
import { MultiImageInput } from './image-inputs';
import { Card, CardTitle } from './page-header';
import { chipStyles, MonthPicker } from './pickers';
import { useAdmin } from './provider';

function useAction() {
  const { toast } = useAdmin();
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) =>
    startTransition(async () => {
      const result = await fn();
      if (result.message || !result.ok) toast(result.ok, result.message);
      if (result.ok) onOk?.();
    });
  return [pending, run] as const;
}

export function ProductGallery({ productId, images }: { productId: number; images: { id: number; url: string }[] }) {
  const { t } = useAdmin();
  const [files, setFiles] = useState<File[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploading, runUpload] = useAction();
  const [removing, runRemove] = useAction();

  const upload = () => {
    const data = new FormData();
    files.forEach((file) => data.append('images', file));
    runUpload(() => uploadProductImages(productId, data), () => setFiles([]));
  };

  return (
    <Card>
      <CardTitle title={t.products.gallery} description={t.products.galleryHint} />
      {images.length > 0 ? (
        <ul className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, i) => (
            <li key={image.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-50 ring-1 ring-stone-200/70 dark:bg-white/5 dark:ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" loading="lazy" className="size-full object-contain p-2" />
              {i === 0 && (
                <span className="absolute start-2 top-2 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">1</span>
              )}
              <button
                type="button"
                onClick={() => setDeleting(image.id)}
                aria-label={t.fields.removeImage}
                className="absolute end-2 top-2 grid size-8 place-items-center rounded-lg bg-stone-950/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
              >
                <AdminIcon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <AdminIcon name="image" />
          {t.products.noImages}
        </p>
      )}

      <MultiImageInput files={files} onChange={setFiles} />
      {files.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={upload} disabled={uploading} className={adminButton()}>
            {uploading ? <Spinner /> : <AdminIcon name="upload" />}
            {uploading ? t.products.uploading : `${t.products.uploadImages} (${files.length})`}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={removing}
        onConfirm={() => deleting && runRemove(() => deleteProductImage(productId, deleting), () => setDeleting(null))}
      />
    </Card>
  );
}

function ChipList({ items, onRemove, busy }: { items: { key: number; label: string; removable: boolean }[]; onRemove: (key: number) => void; busy: boolean }) {
  const { t } = useAdmin();
  if (!items.length) return <p className="text-sm text-stone-400 dark:text-stone-500">{t.products.noneSelected}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.key} className={chipStyles}>
          {item.label}
          {item.removable && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onRemove(item.key)}
              aria-label={`${t.common.delete} ${item.label}`}
              className="grid size-5 place-items-center rounded-full hover:bg-brand-200/60 disabled:opacity-50 dark:hover:bg-brand-500/20"
            >
              <AdminIcon name="x" size={12} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ProductVarieties({ productId, varieties }: { productId: number; varieties: { id: number; name: string }[] }) {
  const { t } = useAdmin();
  const [draft, setDraft] = useState('');
  const [pending, run] = useAction();

  const add = () => draft.trim() && run(() => addVariety(productId, draft), () => setDraft(''));

  return (
    <Card>
      <CardTitle title={t.products.varieties} description={t.products.varietiesHint} />
      <ChipList
        busy={pending}
        items={varieties.map((v) => ({ key: v.id, label: v.name, removable: true }))}
        onRemove={(id) => run(() => removeVariety(productId, id))}
      />
      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={t.products.addPlaceholder}
          className={inputStyles}
        />
        <button type="button" onClick={add} disabled={pending || !draft.trim()} aria-label={t.common.add} className={adminButton({ size: 'icon', className: 'size-[42px]' })}>
          {pending ? <Spinner /> : <AdminIcon name="plus" />}
        </button>
      </div>
    </Card>
  );
}

export function ProductLinks({ productId, kind, items, options }: { productId: number; kind: ProductLinkKind; items: LinkItem[]; options: Option[] }) {
  const { t, locale } = useAdmin();
  const config = productLinks[kind];
  const [choice, setChoice] = useState('');
  const [newName, setNewName] = useState('');
  const [pending, run] = useAction();

  const linked = new Set(items.map((i) => i.lookupId));
  const available = options.filter((o) => !linked.has(o.id));
  const labelOf = (item: LinkItem) => {
    const option = options.find((o) => o.id === item.lookupId);
    return option ? (locale === 'ar' ? option.labelAr : option.label) : item.label;
  };

  const add = () => {
    const lookupId = Number(choice) || undefined;
    if (!lookupId && !newName.trim()) return;
    run(() => addProductLink(kind, productId, { lookupId, newName }), () => {
      setChoice('');
      setNewName('');
    });
  };

  return (
    <Card>
      <CardTitle
        title={t.products[kind]}
        action={
          <Link href={`/admin/${config.lookupPage}`} className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {t.products.manageLookups}
          </Link>
        }
      />
      <ChipList
        busy={pending}
        items={items.map((item) => ({ key: item.linkId ?? -item.lookupId, label: labelOf(item), removable: item.linkId !== null }))}
        onRemove={(linkId) => run(() => removeProductLink(kind, productId, linkId))}
      />
      <div className="mt-4 flex gap-2">
        {available.length > 0 && (
          <select value={choice} onChange={(e) => setChoice(e.target.value)} className={inputStyles} aria-label={t.products.pickExisting}>
            <option value="">{t.products.pickExisting}</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>
                {locale === 'ar' ? o.labelAr : o.label}
              </option>
            ))}
          </select>
        )}
        {config.creatable && !choice && (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder={t.products.addPlaceholder}
            className={inputStyles}
          />
        )}
        <button
          type="button"
          onClick={add}
          disabled={pending || (!choice && !newName.trim())}
          aria-label={t.common.add}
          className={adminButton({ size: 'icon', className: 'size-[42px]' })}
        >
          {pending ? <Spinner /> : <AdminIcon name="plus" />}
        </button>
      </div>
    </Card>
  );
}

export function ProductHarvest({ productId, months }: { productId: number; months: MonthLink[] }) {
  const { t } = useAdmin();
  const [pending, run] = useAction();

  return (
    <Card>
      <CardTitle title={t.products.harvest} description={t.products.harvestHint} />
      <MonthPicker
        disabled={pending}
        selected={months.map((m) => m.code)}
        onToggle={(code) => {
          const existing = months.find((m) => m.code === code);
          if (existing && existing.linkId === null) return;
          run(() => toggleHarvestMonth(productId, code, existing?.linkId ?? null));
        }}
      />
    </Card>
  );
}
