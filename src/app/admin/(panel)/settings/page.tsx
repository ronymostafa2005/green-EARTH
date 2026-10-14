import type { Metadata } from 'next';
import { adminRequest } from '@/admin/api';
import { getDictionary } from '@/admin/session';
import { PageHeader } from '@/admin/ui/page-header';
import { SettingsForm } from '@/admin/ui/settings-form';
import type { CompanySettings } from '@/lib/site-content';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).settings.title };
}

export default async function SettingsPage() {
  const [t, settings] = await Promise.all([getDictionary(), adminRequest<CompanySettings | null>('CompanySettings/Get')]);
  return (
    <>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <SettingsForm settings={settings} />
    </>
  );
}
