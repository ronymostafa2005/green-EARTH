import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminRequest } from '@/admin/api';
import { getDictionary } from '@/admin/session';
import { PageHeader } from '@/admin/ui/page-header';
import { SectionEditor } from '@/admin/ui/section-editor';
import { adminButton } from '@/admin/ui/styles';
import { apiAssetUrl } from '@/lib/api';
import { siteSectionKeys, type SiteSection, type SiteSectionKey } from '@/lib/site-content';

type SectionPageProps = { params: Promise<{ key: string }> };

const isSectionKey = (value: string): value is SiteSectionKey => (siteSectionKeys as readonly string[]).includes(value);
const publicPath: Record<SiteSectionKey, string> = { welcome: '/', about: '/about', quality: '/quality', export: '/export' };

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { key } = await params;
  return isSectionKey(key) ? { title: (await getDictionary()).nav[key] } : {};
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { key } = await params;
  if (!isSectionKey(key)) notFound();

  const [t, section] = await Promise.all([getDictionary(), adminRequest<SiteSection | null>(`SiteSection/GetByKey/${key}`)]);

  return (
    <>
      <PageHeader
        title={t.nav[key]}
        description={t.sections.description}
        actions={
          <Link href={publicPath[key]} target="_blank" className={adminButton({ variant: 'secondary' })}>
            {t.common.viewSite}
          </Link>
        }
      />
      <SectionEditor key={section?.id ?? 0} sectionKey={key} section={section} imageUrl={apiAssetUrl(section?.image)} />
    </>
  );
}
