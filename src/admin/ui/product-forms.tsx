'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createProduct, updateProduct } from '../actions';
import type { Option } from '../products';
import { adminButton, BilingualField, Field, inputStyles, Spinner, useFormSubmit, useResultToast } from './controls';
import { MultiImageInput } from './image-inputs';
import { Card, CardTitle } from './page-header';
import { ChipSelect, MonthPicker, TagInput } from './pickers';
import { useAdmin } from './provider';

export function CategorySelect({ categories, defaultValue }: { categories: Option[]; defaultValue?: number }) {
  const { t, locale } = useAdmin();
  return (
    <Field label={t.fields.category} required>
      <select name="productCategoryId" required defaultValue={defaultValue ?? ''} className={inputStyles}>
        <option value="" disabled>
          {t.fields.selectCategory}
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {locale === 'ar' ? c.labelAr : c.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function SaveBar({ pending, label, cancelHref }: { pending: boolean; label: string; cancelHref?: string }) {
  const { t } = useAdmin();
  return (
    <div className="sticky bottom-4 z-10 flex justify-end gap-2 rounded-2xl bg-white/85 p-3 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.25)] ring-1 ring-brand-950/10 backdrop-blur-xl dark:bg-[#171a14]/85 dark:ring-white/10">
      {cancelHref && (
        <Link href={cancelHref} className={adminButton({ variant: 'secondary' })}>
          {t.common.cancel}
        </Link>
      )}
      <button type="submit" disabled={pending} className={adminButton()}>
        {pending && <Spinner />}
        {pending ? t.common.saving : label}
      </button>
    </div>
  );
}

export function ProductCreateForm({
  categories,
  defaultCategoryId,
  types,
  packing,
  vitamins,
  minerals,
}: {
  categories: Option[];
  defaultCategoryId?: number;
  types: Option[];
  packing: Option[];
  vitamins: Option[];
  minerals: Option[];
}) {
  const { t, locale } = useAdmin();
  const [images, setImages] = useState<File[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [packingNames, setPackingNames] = useState<string[]>([]);
  const [vitaminIds, setVitaminIds] = useState<number[]>([]);
  const [mineralIds, setMineralIds] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);

  const [state, onSubmit, pending] = useFormSubmit(createProduct, (data) => images.forEach((file) => data.append('images', file)));
  useResultToast(state);

  const label = (o: Option) => (locale === 'ar' ? o.labelAr : o.label);

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card>
        <CardTitle title={t.products.basicInfo} />
        <div className="grid gap-5">
          <BilingualField name="name" label={t.fields.name} required />
          <div className="sm:max-w-sm">
            <CategorySelect categories={categories} defaultValue={defaultCategoryId} />
          </div>
          <BilingualField name="description" label={t.fields.description} multiline />
        </div>
      </Card>

      <Card>
        <CardTitle title={t.products.gallery} description={t.products.galleryHint} />
        <MultiImageInput files={images} onChange={setImages} />
      </Card>

      <Card>
        <CardTitle title={t.products.attributes} />
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label={t.products.varieties} hint={t.products.varietiesHint}>
            <TagInput name="varieties" values={varieties} onChange={setVarieties} />
          </Field>
          <Field label={t.products.types}>
            <TagInput name="types" values={typeNames} onChange={setTypeNames} suggestions={types.map((o) => o.label)} />
          </Field>
          <Field label={t.products.packing}>
            <TagInput name="packing" values={packingNames} onChange={setPackingNames} suggestions={packing.map((o) => o.label)} />
          </Field>
          <div className="grid content-start gap-6">
            {vitamins.length > 0 && (
              <div className="grid gap-2">
                <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{t.products.vitamins}</span>
                <ChipSelect name="vitamins" options={vitamins.map((o) => ({ id: o.id, label: label(o) }))} selected={vitaminIds} onChange={setVitaminIds} />
              </div>
            )}
            {minerals.length > 0 && (
              <div className="grid gap-2">
                <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{t.products.minerals}</span>
                <ChipSelect name="minerals" options={minerals.map((o) => ({ id: o.id, label: label(o) }))} selected={mineralIds} onChange={setMineralIds} />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle title={t.products.harvest} description={t.products.harvestHint} />
        <MonthPicker
          name="months"
          selected={months}
          onToggle={(code) => setMonths((list) => (list.includes(code) ? list.filter((m) => m !== code) : [...list, code]))}
        />
      </Card>

      <SaveBar pending={pending} label={t.common.create} cancelHref="/admin/products" />
    </form>
  );
}

export function ProductBasicsForm({
  product,
  categories,
}: {
  product: { id: number; name: string; nameLocalization: string | null; description: string | null; descriptionLocalization: string | null; productCategoryId: number };
  categories: Option[];
}) {
  const { t } = useAdmin();
  const [state, onSubmit, pending] = useFormSubmit(updateProduct.bind(null, product.id));
  useResultToast(state);

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardTitle title={t.products.basicInfo} />
        <div className="grid gap-5">
          <BilingualField name="name" label={t.fields.name} required defaultValues={{ en: product.name, ar: product.nameLocalization }} />
          <div className="sm:max-w-sm">
            <CategorySelect categories={categories} defaultValue={product.productCategoryId} />
          </div>
          <BilingualField
            name="description"
            label={t.fields.description}
            multiline
            defaultValues={{ en: product.description, ar: product.descriptionLocalization }}
          />
        </div>
        <div className="mt-6 flex justify-end border-t border-stone-100 pt-5 dark:border-white/5">
          <button type="submit" disabled={pending} className={adminButton()}>
            {pending && <Spinner />}
            {pending ? t.common.saving : t.common.save}
          </button>
        </div>
      </Card>
    </form>
  );
}
