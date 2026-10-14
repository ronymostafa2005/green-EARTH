'use client';

import { useState } from 'react';
import type { CompanySettings } from '@/lib/site-content';
import { saveCompanySettings } from '../actions';
import { adminButton, BilingualField, Field, inputStyles, Spinner, useFormSubmit, useResultToast } from './controls';
import { AdminIcon, type AdminIconName } from './icon';
import { Card, CardTitle } from './page-header';
import { TagInput } from './pickers';
import { useAdmin } from './provider';

function ListField({ name, label, hint, icon, initial }: { name: string; label: string; hint: string; icon: AdminIconName; initial: string[] }) {
  const [values, setValues] = useState(initial);
  return (
    <div className="grid gap-1.5">
      <span className="flex items-center gap-2 text-[13px] font-semibold text-stone-700 dark:text-stone-300">
        <AdminIcon name={icon} size={15} className="text-brand-600 dark:text-brand-400" />
        {label}
      </span>
      <div dir="ltr">
        <TagInput name={name} values={values} onChange={setValues} />
      </div>
      <span className="text-xs text-stone-500 dark:text-stone-400">{hint}</span>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: CompanySettings | null }) {
  const { t } = useAdmin();
  const [state, onSubmit, pending] = useFormSubmit(saveCompanySettings);
  useResultToast(state);

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle title={t.settings.contact} />
          <div className="grid gap-5">
            <ListField name="phones" label={t.settings.phones} hint={t.settings.phonesHint} icon="phone" initial={settings?.phones ?? []} />
            <ListField name="emails" label={t.settings.emails} hint={t.settings.emailsHint} icon="mail" initial={settings?.emails ?? []} />
            <Field label={t.settings.whatsapp} hint={t.settings.whatsappHint}>
              <input name="whatsapp" dir="ltr" inputMode="tel" defaultValue={settings?.whatsapp ?? ''} placeholder="201234567890" className={inputStyles} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardTitle title={t.settings.notifications} />
          <Field label={t.settings.notificationEmail} hint={t.settings.notificationEmailHint}>
            <input name="notificationEmail" type="email" dir="ltr" defaultValue={settings?.notificationEmail ?? ''} className={inputStyles} />
          </Field>
        </Card>
      </div>

      <Card>
        <CardTitle title={t.settings.location} />
        <div className="grid gap-5">
          <BilingualField name="address" label={t.settings.address} defaultValues={{ en: settings?.address, ar: settings?.addressLocalization }} />
          <BilingualField
            name="workingHours"
            label={t.settings.workingHours}
            defaultValues={{ en: settings?.workingHours, ar: settings?.workingHoursLocalization }}
          />
          <Field label={t.settings.mapUrl} hint={t.settings.mapUrlHint}>
            <input name="mapUrl" dir="ltr" defaultValue={settings?.mapUrl ?? ''} placeholder="https://www.google.com/maps/embed?pb=…" className={inputStyles} />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="submit" disabled={pending} className={adminButton({ size: 'lg', className: 'shadow-lg shadow-brand-900/20' })}>
          {pending && <Spinner />}
          {pending ? t.common.saving : t.common.save}
        </button>
      </div>
    </form>
  );
}
