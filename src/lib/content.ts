import { cache } from 'react';
import { certificates as fallbackCertificates, exhibitions as fallbackExhibitions } from '@/data/company';
import { categories as localCategories, getCategoryLabel, products as localProducts } from '@/data/products';
import {
  apiAssetUrl,
  getAllProducts,
  getCertifications,
  getExhibitions,
  getProductById,
  USE_MOCK_DATA,
  type ApiNamedItem,
  type ApiProduct,
} from '@/lib/api';
import { getHiddenProductIds } from '@/lib/visibility';
import type { LocalProduct, Product, ProductCategory, ProductSpec } from '@/types';

export type Certificate = {
  id: string | number;
  name: string;
  note: string;
  image: string | null;
};

export type Exhibition = {
  id: string | number;
  name: string;
  year: string;
  city: string;
  image: string | null;
};

function logApiFailure(what: string, error: unknown) {
  console.error(`[api] ${what}: ${error instanceof Error ? error.message : String(error)}`);
}

const mockCertificates = (): Certificate[] => fallbackCertificates.map((cert) => ({ id: cert.name, ...cert }));

const mockExhibitions = (): Exhibition[] =>
  fallbackExhibitions.map((event) => ({ id: event.name, ...event, year: String(event.year) }));

export async function loadCertificates(): Promise<Certificate[]> {
  if (USE_MOCK_DATA) return mockCertificates();

  try {
    const { data } = await getCertifications();
    return data.map((cert) => ({
      id: cert.id,
      name: cert.name,
      note: cert.description ?? '',
      image: apiAssetUrl(cert.certificationUrl),
    }));
  } catch (error) {
    logApiFailure('Certifications failed, using local data', error);
    return mockCertificates();
  }
}

export async function loadExhibitions(): Promise<Exhibition[]> {
  if (USE_MOCK_DATA) return mockExhibitions();

  try {
    const { data } = await getExhibitions();
    return data.map((event) => ({
      id: event.id,
      name: event.name,
      year: event.year ?? '',
      city: event.location ?? '',
      image: apiAssetUrl(event.exhibitionUrl),
    }));
  } catch (error) {
    logApiFailure('Exhibitions failed, using local data', error);
    return mockExhibitions();
  }
}

export type ProductCatalog = {
  categories: ProductCategory[];
  products: Product[];
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sameText = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

function findLocalProduct(name: string) {
  return localProducts.find((p) => sameText(p.name, name) || p.slug === slugify(name));
}

function categoryFromApi(product: ApiProduct): ProductCategory {
  const label = product.productCategoryName ?? '';
  const known = localCategories.find((c) => sameText(c.label, label) || c.id === slugify(label));
  if (known) return { id: known.id, label: known.label };
  return { id: slugify(label) || `category-${product.productCategoryId}`, label };
}

const names = (items: ApiNamedItem[] | null) => (items ?? []).map((item) => item.name.replace(/\s+/g, ' ').trim());

function specsFromApi(product: ApiProduct): ProductSpec[] {
  const rows: [string, ApiNamedItem[] | null][] = [
    ['Varieties', product.varieties],
    ['Types', product.types],
    ['Vitamins', product.vitamins],
    ['Minerals', product.minerals],
  ];
  return rows.filter(([, items]) => items?.length).map(([label, items]) => ({ label, value: names(items).join(', ') }));
}

function fromLocal(product: LocalProduct): Product {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: getCategoryLabel(product.category),
    images: [product.image, ...(product.pack ? [product.pack] : [])],
    summary: product.summary,
    specs: product.specs,
  };
}

function fromApi(product: ApiProduct): Product {
  const local = findLocalProduct(product.name);
  const category = categoryFromApi(product);
  const images = [...(product.images ?? [])]
    .sort((a, b) => a.id - b.id)
    .map((img) => apiAssetUrl(img.imagePath))
    .filter((src): src is string => !!src);
  const specs = specsFromApi(product);
  const packing = names(product.packingTypes);
  const harvestMonths = (product.harvestMonths ?? []).map((m) => m.code);

  return {
    id: product.id,
    slug: slugify(product.name) || `product-${product.id}`,
    name: product.name,
    category: category.id,
    categoryLabel: category.label,
    images: images.length ? images : local ? fromLocal(local).images : [],
    summary: product.description ?? local?.summary ?? '',
    specs: specs.length ? specs : local?.specs,
    packing: packing.length ? packing : undefined,
    harvestMonths: harvestMonths.length ? harvestMonths : undefined,
  };
}

const localCatalog = (): ProductCatalog => ({
  categories: localCategories.map((c) => ({ id: c.id, label: c.label })),
  products: localProducts.map(fromLocal),
});

export const loadProductCatalog = cache(async (): Promise<ProductCatalog> => {
  if (USE_MOCK_DATA) return localCatalog();

  try {
    const [apiProducts, hidden] = await Promise.all([getAllProducts(), getHiddenProductIds()]);
    if (!apiProducts.length) return localCatalog();

    const products = apiProducts.filter((p) => !hidden.has(p.id)).map(fromApi);
    const order = (id: string) => {
      const index = localCategories.findIndex((c) => c.id === id);
      return index === -1 ? localCategories.length : index;
    };
    const categories = [...new Map(products.map((p) => [p.category, { id: p.category, label: p.categoryLabel }])).values()].sort(
      (a, b) => order(a.id) - order(b.id),
    );
    return { categories, products };
  } catch (error) {
    logApiFailure('Products failed, using local data', error);
    return localCatalog();
  }
});

export async function loadProduct(slug: string) {
  const { products } = await loadProductCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product?.id) return product;

  try {
    const details = fromApi(await getProductById(product.id));
    return { ...product, ...details, slug: product.slug };
  } catch (error) {
    logApiFailure(`Product ${product.id} failed`, error);
    return product;
  }
}
