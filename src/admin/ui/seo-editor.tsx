'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MetaPage, MetaTag } from '@/lib/site-content';
import { saveMetaTag } from '../actions';
import { adminButton, Field, inputStyles, Spinner, useFormSubmit, useResultToast } from './controls';
import { ImageInput } from './image-inputs';
import { Card, CardTitle } from './page-header';
import { TagInput } from './pickers';
import { useAdmin } from './provider';

function Counter({ length, max }: { length: number; max: number }) {
  const { t } = useAdmin();
  return (
    <span className={cn('tabular-nums', length > max ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400')}>
      {length} / {max} {t.seo.characters}
    </span>
  );
}

export function SeoEditor({ page, meta, imageUrl, siteUrl }: { page: MetaPage; meta: MetaTag | null; imageUrl: string | null; siteUrl: string }) {
  const { t } = useAdmin();
  const [title, setTitle] = useState(meta?.title ?? '');
  const [description, setDescription] = useState(meta?.description ?? '');
  const [keywords, setKeywords] = useState(() =>
    (meta?.keywords ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
  );
  const [state, onSubmit, pending] = useFormSubmit(saveMetaTag.bind(null, page));
  useResultToast(state);

  const path = page === 'home' ? '' : `/${page}`;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="grid content-start gap-6">
        <Card>
          <CardTitle title={t.seo.pages[page]} />
          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t.seo.metaTitle} · ${t.common.english}`} hint={<Counter length={title.length} max={60} />}>
                <input name="title" dir="ltr" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyles} />
              </Field>
              <Field label={`${t.seo.metaTitle} · ${t.common.arabic}`}>
                <input name="titleLocalization" dir="rtl" defaultValue={meta?.titleLocalization ?? ''} className={inputStyles} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t.seo.metaDescription} · ${t.common.english}`} hint={<Counter length={description.length} max={160} />}>
                <textarea
                  name="description"
                  dir="ltr"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(inputStyles, 'resize-y leading-relaxed')}
                />
              </Field>
              <Field label={`${t.seo.metaDescription} · ${t.common.arabic}`} hint={t.seo.metaDescriptionHint}>
                <textarea
                  name="descriptionLocalization"
                  dir="rtl"
                  rows={4}
                  defaultValue={meta?.descriptionLocalization ?? ''}
                  className={cn(inputStyles, 'resize-y leading-relaxed')}
                />
              </Field>
            </div>
            <div className="grid gap-1.5">
              <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{t.seo.keywords}</span>
              <TagInput name="keywords" values={keywords} onChange={setKeywords} />
              <span className="text-xs text-stone-500 dark:text-stone-400">{t.seo.keywordsHint}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle title={t.seo.preview} />
          <div className="rounded-2xl bg-[#fbfcf9] p-5 ring-1 ring-stone-200/70 dark:bg-white/[0.03] dark:ring-white/10" dir="ltr">
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
              {siteUrl.replace(/^https?:\/\//, '')}
              {path}
            </p>
            <p className="mt-1 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{title || t.seo.pages[page]}</p>
            <p className="mt-1 line-clamp-2 text-sm text-stone-600 dark:text-stone-300">{description || '—'}</p>
          </div>
        </Card>
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <ImageInput name="image" label={t.seo.ogImage} currentUrl={imageUrl} />
          <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">{t.seo.ogImageHint}</p>
        </Card>
        <button type="submit" disabled={pending} className={adminButton({ size: 'lg' })}>
          {pending && <Spinner />}
          {pending ? t.common.saving : t.common.save}
        </button>
      </div>
    </form>
  );
}
