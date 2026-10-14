import { apiAssetUrl } from '@/lib/api';
import { productSlug } from '@/lib/content';
import { tryListAll } from './api';
import { productLinks, type ProductLinkKind, type Row } from './resources';

export type Option = { id: number; label: string; labelAr: string };
export type LinkItem = { linkId: number | null; lookupId: number; label: string };
export type MonthLink = { code: number; linkId: number | null };

export type ProductDetail = Row & {
  name: string;
  nameLocalization: string | null;
  description: string | null;
  descriptionLocalization: string | null;
  productCategoryId: number;
  productCategoryName: string | null;
  slug?: string | null;
  displayOrder?: number | null;
  showOnHome?: boolean | null;
  images: { id: number; imagePath: string | null }[] | null;
  varieties: { id: number; name: string }[] | null;
  types: { id: number; name: string }[] | null;
  packingTypes: { id: number; name: string }[] | null;
  vitamins: { id: number; name: string }[] | null;
  minerals: { id: number; name: string }[] | null;
  harvestMonths: { code: number }[] | null;
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const toOptions = (rows: Row[] | null): Option[] =>
  (rows ?? []).map((row) => ({ id: row.id, label: str(row.name) || str(row.nameLocalization), labelAr: str(row.nameLocalization) || str(row.name) }));

export { productSlug };

export function productImages(product: Pick<ProductDetail, 'images'>) {
  return [...(product.images ?? [])]
    .sort((a, b) => a.id - b.id)
    .map((img) => ({ id: img.id, url: apiAssetUrl(img.imagePath) }))
    .filter((img): img is { id: number; url: string } => !!img.url);
}

const detailKey: Record<ProductLinkKind, 'types' | 'packingTypes' | 'vitamins' | 'minerals'> = {
  types: 'types',
  packing: 'packingTypes',
  vitamins: 'vitamins',
  minerals: 'minerals',
};

/** Current links for a product, with the link ids needed to remove them. */
export async function loadProductLinks(product: ProductDetail, kind: ProductLinkKind, lookups: Option[]): Promise<LinkItem[]> {
  const config = productLinks[kind];
  const rows = await tryListAll(config.link, { productId: product.id });
  const labelOf = (id: number) => lookups.find((o) => o.id === id)?.label;

  if (rows) {
    return rows
      .filter((row) => row.productId === undefined || Number(row.productId) === product.id)
      .map((row) => {
        const nested = row[config.idKey.replace(/Id$/, '')] as Row | undefined;
        const lookupId = Number(row[config.idKey] ?? nested?.id);
        return { linkId: row.id, lookupId, label: labelOf(lookupId) ?? (str(nested?.name) || str(row.name) || `#${lookupId}`) };
      });
  }

  return (product[detailKey[kind]] ?? []).map((item) => ({ linkId: null, lookupId: item.id, label: labelOf(item.id) ?? item.name }));
}

export async function loadHarvestLinks(product: ProductDetail): Promise<MonthLink[]> {
  const rows = await tryListAll('ProductHarvestMonth', { productId: product.id });
  if (rows) {
    return rows
      .filter((row) => row.productId === undefined || Number(row.productId) === product.id)
      .map((row) => ({ linkId: row.id, code: Number(row.monthStatusCode ?? row.monthCode ?? row.code) }))
      .filter((m) => m.code >= 1 && m.code <= 12);
  }
  return (product.harvestMonths ?? []).map((m) => ({ linkId: null, code: m.code }));
}
