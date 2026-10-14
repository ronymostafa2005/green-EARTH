import type { Metadata } from 'next';
import Link from 'next/link';
import { listAll } from '@/admin/api';
import { productImages, productSlug, toOptions, type ProductDetail } from '@/admin/products';
import { getDictionary } from '@/admin/session';
import { adminButton } from '@/admin/ui/styles';
import { AdminIcon } from '@/admin/ui/icon';
import { PageHeader } from '@/admin/ui/page-header';
import { ProductsTable } from '@/admin/ui/products-table';
import { getHiddenProductIds } from '@/lib/visibility';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).products.title };
}

type ProductsPageProps = { searchParams: Promise<{ created?: string; category?: string }> };

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { created, category } = await searchParams;
  const t = await getDictionary();
  const [products, categories, hidden] = await Promise.all([listAll<ProductDetail>('Product'), listAll('ProductCategory'), getHiddenProductIds()]);

  return (
    <>
      <PageHeader
        title={t.products.title}
        description={t.products.description}
        actions={
          <Link href="/admin/products/new" className={adminButton()}>
            <AdminIcon name="plus" />
            {t.products.new}
          </Link>
        }
      />
      <ProductsTable
        key={category ?? 'all'}
        created={created === '1'}
        initialCategory={categories.some((c) => c.id === Number(category)) ? Number(category) : 'all'}
        categories={toOptions(categories)}
        products={products.map((p) => {
          const images = productImages(p);
          return {
            id: p.id,
            name: p.name,
            nameLocalization: p.nameLocalization,
            categoryId: p.productCategoryId,
            categoryName: p.productCategoryName,
            thumbnail: images[0]?.url ?? null,
            imageCount: images.length,
            visible: !hidden.has(p.id),
            slug: productSlug(p),
          };
        })}
      />
    </>
  );
}
