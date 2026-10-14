import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getById, listAll, tryListAll } from '@/admin/api';
import { loadHarvestLinks, loadProductLinks, productImages, productSlug, toOptions, type ProductDetail } from '@/admin/products';
import { getDictionary } from '@/admin/session';
import { adminButton } from '@/admin/ui/styles';
import { AdminIcon } from '@/admin/ui/icon';
import { PageHeader } from '@/admin/ui/page-header';
import { ProductBasicsForm } from '@/admin/ui/product-forms';
import { ProductGallery, ProductHarvest, ProductLinks, ProductVarieties } from '@/admin/ui/product-editor';
import { ApiError } from '@/lib/api';

type EditProductPageProps = { params: Promise<{ id: string }> };

async function loadProduct(id: number) {
  try {
    return await getById<ProductDetail>('Product', id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  return { title: `${(await getDictionary()).products.editTitle} #${(await params).id}` };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const t = await getDictionary();
  const product = await loadProduct(id);
  if (!product) notFound();

  const [categories, types, packing, vitamins, minerals] = await Promise.all([
    listAll('ProductCategory'),
    tryListAll('Type'),
    tryListAll('PackingType'),
    tryListAll('Vitamin'),
    tryListAll('Mineral'),
  ]);
  const lookups = { types: toOptions(types), packing: toOptions(packing), vitamins: toOptions(vitamins), minerals: toOptions(minerals) };

  const [typeLinks, packingLinks, vitaminLinks, mineralLinks, months] = await Promise.all([
    loadProductLinks(product, 'types', lookups.types),
    loadProductLinks(product, 'packing', lookups.packing),
    loadProductLinks(product, 'vitamins', lookups.vitamins),
    loadProductLinks(product, 'minerals', lookups.minerals),
    loadHarvestLinks(product),
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
        title={product.name}
        description={product.nameLocalization ?? undefined}
        actions={
          <a href={`/products/${productSlug(product)}`} target="_blank" rel="noreferrer" className={adminButton({ variant: 'secondary' })}>
            <AdminIcon name="external" size={16} />
            {t.products.viewOnSite}
          </a>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <ProductBasicsForm product={product} categories={toOptions(categories)} />
          <div id="gallery" className="scroll-mt-24">
            <ProductGallery productId={product.id} images={productImages(product)} />
          </div>
        </div>
        <div className="grid gap-6">
          <ProductVarieties productId={product.id} varieties={product.varieties ?? []} />
          <div id="types" className="scroll-mt-24">
            <ProductLinks productId={product.id} kind="types" items={typeLinks} options={lookups.types} />
          </div>
          <ProductLinks productId={product.id} kind="packing" items={packingLinks} options={lookups.packing} />
          <ProductLinks productId={product.id} kind="vitamins" items={vitaminLinks} options={lookups.vitamins} />
          <ProductLinks productId={product.id} kind="minerals" items={mineralLinks} options={lookups.minerals} />
          <ProductHarvest productId={product.id} months={months} />
        </div>
      </div>
    </>
  );
}
