import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listAll } from '@/admin/api';
import { isResourceKey, resources, rowImagePath } from '@/admin/resources';
import { getDictionary } from '@/admin/session';
import { PageHeader } from '@/admin/ui/page-header';
import { ResourceManager } from '@/admin/ui/resource-manager';
import { apiAssetUrl } from '@/lib/api';

type ResourcePageProps = { params: Promise<{ resource: string }> };

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { resource } = await params;
  if (!isResourceKey(resource)) return {};
  return { title: (await getDictionary()).resources[resource].title };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();

  const config = resources[resource];
  const t = await getDictionary();
  const rows = await listAll(config.endpoint);

  return (
    <>
      <PageHeader title={t.resources[resource].title} description={t.resources[resource].description} />
      <ResourceManager
        resourceKey={resource}
        rows={rows.map((row) => ({ ...row, imageUrl: config.imageKey ? apiAssetUrl(rowImagePath(row, config.imageKey)) : null }))}
      />
    </>
  );
}
