'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { sectionIcons, type SiteSection, type SiteSectionKey } from '@/lib/site-content';
import { saveSiteSection } from '../actions';
import { adminButton, BilingualField, Spinner, useFormSubmit, useResultToast } from './controls';
import { AdminIcon, type AdminIconName } from './icon';
import { ImageInput } from './image-inputs';
import { Card, CardTitle } from './page-header';
import { useAdmin } from './provider';

type Item = NonNullable<SiteSection['items']>[number] & { uid: number };

let nextUid = 0;
const blankItem = (): Item => ({ uid: nextUid++, title: '', titleLocalization: '', description: '', descriptionLocalization: '', icon: 'leaf' });

export function SectionEditor({ sectionKey, section, imageUrl }: { sectionKey: SiteSectionKey; section: SiteSection | null; imageUrl: string | null }) {
  const { t } = useAdmin();
  const [items, setItems] = useState<Item[]>(() => (section?.items ?? []).map((item) => ({ ...item, uid: nextUid++ })));
  const [state, onSubmit, pending] = useFormSubmit(saveSiteSection.bind(null, sectionKey));
  useResultToast(state);

  const move = (index: number, by: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {!section?.id && (
        <p className="flex items-start gap-3 rounded-2xl bg-sand-100/70 px-4 py-3 text-sm text-amber-900 ring-1 ring-sand-300/50 dark:bg-sand-500/10 dark:text-sand-200 dark:ring-sand-500/20">
          <AdminIcon name="alert" className="mt-0.5 shrink-0" />
          {t.sections.notFilled}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card>
          <CardTitle title={t.sections.heading} />
          <div className="grid gap-5">
            <BilingualField name="title" label={t.sections.heading} defaultValues={{ en: section?.title, ar: section?.titleLocalization }} />
            <BilingualField
              name="details"
              label={t.sections.details}
              multiline
              rows={9}
              hint={t.sections.detailsHint}
              defaultValues={{ en: section?.details, ar: section?.detailsLocalization }}
            />
          </div>
        </Card>
        <Card className="h-fit">
          <ImageInput name="image" label={t.sections.image} currentUrl={imageUrl} />
        </Card>
      </div>

      <Card>
        <CardTitle
          title={t.sections.items}
          description={t.sections.itemsHint}
          action={
            <button type="button" onClick={() => setItems((list) => [...list, blankItem()])} className={adminButton({ variant: 'secondary', size: 'sm' })}>
              <AdminIcon name="plus" size={16} />
              {t.sections.addItem}
            </button>
          }
        />
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => setItems([blankItem()])}
            className="grid w-full place-items-center gap-2 rounded-2xl border-2 border-dashed border-brand-900/10 py-10 text-sm text-stone-500 transition hover:border-brand-500/40 hover:text-brand-700 dark:border-white/10 dark:text-stone-400 dark:hover:text-brand-300"
          >
            <AdminIcon name="plus" size={22} />
            {t.sections.addItem}
          </button>
        ) : (
          <ol className="grid gap-4">
            {items.map((item, index) => (
              <li key={item.uid} className="rounded-2xl border border-stone-200/80 bg-[#fbfcf9] p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white dark:bg-brand-500 dark:text-brand-950">{index + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={t.sections.moveUp}
                      className={adminButton({ variant: 'ghost', size: 'icon' })}
                    >
                      <AdminIcon name="arrowUp" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label={t.sections.moveDown}
                      className={adminButton({ variant: 'ghost', size: 'icon' })}
                    >
                      <AdminIcon name="arrowDown" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((list) => list.filter((i) => i.uid !== item.uid))}
                      aria-label={t.sections.removeItem}
                      className={adminButton({ variant: 'dangerGhost', size: 'icon' })}
                    >
                      <AdminIcon name="trash" size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid gap-4">
                  <IconPicker defaultValue={item.icon} />
                  <BilingualField name="itemTitle" label={t.sections.itemTitle} defaultValues={{ en: item.title, ar: item.titleLocalization }} />
                  <BilingualField
                    name="itemDescription"
                    label={t.sections.itemDescription}
                    multiline
                    rows={3}
                    defaultValues={{ en: item.description, ar: item.descriptionLocalization }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="submit" disabled={pending} className={cn(adminButton({ size: 'lg' }), 'shadow-lg shadow-brand-900/20')}>
          {pending && <Spinner />}
          {pending ? t.common.saving : t.common.save}
        </button>
      </div>
    </form>
  );
}

function IconPicker({ defaultValue }: { defaultValue: string | null }) {
  const { t } = useAdmin();
  const [value, setValue] = useState(sectionIcons.includes(defaultValue as never) ? defaultValue! : 'leaf');
  return (
    <div role="group" aria-label={t.sections.icon} className="grid gap-1.5">
      <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{t.sections.icon}</span>
      <input type="hidden" name="itemIcon" value={value} />
      <div className="flex flex-wrap gap-2">
        {sectionIcons.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => setValue(icon)}
            aria-pressed={value === icon}
            aria-label={icon}
            className={cn(
              'grid size-10 place-items-center rounded-xl ring-1 transition',
              value === icon
                ? 'bg-brand-600 text-white ring-brand-600 dark:bg-brand-500 dark:text-brand-950'
                : 'bg-white text-stone-500 ring-stone-200 hover:text-brand-700 hover:ring-brand-300 dark:bg-white/5 dark:text-stone-400 dark:ring-white/10 dark:hover:text-brand-300 dark:hover:ring-brand-400/40',
            )}
          >
            <AdminIcon name={icon as AdminIconName} size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
