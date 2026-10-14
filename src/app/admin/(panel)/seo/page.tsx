import type { Metadata } from 'next';
import Link from 'next/link';
import { adminRequest } from '@/admin/api';
import { getDictionary } from '@/admin/session';
import { PageHeader } from '@/admin/ui/page-header';
import { SeoEditor } from '@/admin/ui/seo-editor';
import { siteConfig } from '@/config/site';
import { apiAssetUrl } from '@/lib/api';
import { metaPages, type MetaPage, type MetaTag } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).seo.title };
}

type SeoPageProps = { searchParams: Promise<{ page?: string }> };

export default async function SeoPage({ searchParams }: SeoPageProps) {
  const { page: requested } = await searchParams;
  const page: MetaPage = (metaPages as readonly string[]).includes(requested ?? '') ? (requested as MetaPage) : 'home';
  const [t, meta] = await Promise.all([getDictionary(), adminRequest<MetaTag | null>(`MetaTag/GetByPage/${page}`)]);

  return (
    <>
      <PageHeader title={t.seo.title} description={t.seo.description} />
      <nav className="mb-6 flex gap-1.5 overflow-x-auto pb-1" aria-label={t.seo.title}>
        {metaPages.map((p) => (
          <Link
            key={p}
            href={p === 'home' ? '/admin/seo' : `/admin/seo?page=${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ring-1 transition',
              p === page
                ? 'bg-brand-700 text-white ring-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:ring-brand-500'
                : 'bg-white text-stone-600 ring-stone-200 hover:text-brand-700 hover:ring-brand-300 dark:bg-white/5 dark:text-stone-300 dark:ring-white/10 dark:hover:text-brand-300 dark:hover:ring-brand-400/40',
            )}
          >
            {t.seo.pages[p]}
          </Link>
        ))}
      </nav>
      <SeoEditor key={`${page}-${meta?.id ?? 0}`} page={page} meta={meta} imageUrl={apiAssetUrl(meta?.ogImage)} siteUrl={siteConfig.url} />
    </>
  );
}
