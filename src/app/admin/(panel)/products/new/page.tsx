import type { Metadata } from 'next';
import Link from 'next/link';
import { listAll, tryListAll } from '@/admin/api';
import { toOptions } from '@/admin/products';
import { getDictionary } from '@/admin/session';
import { AdminIcon } from '@/admin/ui/icon';
import { PageHeader } from '@/admin/ui/page-header';
import { ProductCreateForm } from '@/admin/ui/product-forms';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).products.new };
}

type NewProductPageProps = { searchParams: Promise<{ category?: string }> };

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const { category } = await searchParams;
  const t = await getDictionary();
  const [categories, types, packing, vitamins, minerals] = await Promise.all([
    listAll('ProductCategory'),
    tryListAll('Type'),
    tryListAll('PackingType'),
    tryListAll('Vitamin'),
    tryListAll('Mineral'),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
            <AdminIcon name="chevron" size={16} className="ltr:rotate-180" />
            {t.products.title}
          </Link>
        }
        title={t.products.new}
        description={t.products.createdHint}
      />
      <ProductCreateForm
        categories={toOptions(categories)}
        defaultCategoryId={categories.some((c) => c.id === Number(category)) ? Number(category) : undefined}
        types={toOptions(types)}
        packing={toOptions(packing)}
        vitamins={toOptions(vitamins)}
        minerals={toOptions(minerals)}
      />
    </>
  );
}
