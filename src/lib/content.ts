import { cache } from 'react';
import { certificates as fallbackCertificates, exhibitions as fallbackExhibitions } from '@/data/company';
import { categories as localCategories, getCategoryLabel, products as localProducts } from '@/data/products';
import {
  apiAssetUrl,
  getAllProductImages,
  getAllProducts,
  getCertifications,
  getExhibitions,
  getProductById,
  USE_MOCK_DATA,
  type ApiProduct,
  type ApiProductImage,
} from '@/lib/api';
import type { LocalProduct, Product, ProductCategory } from '@/types';

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

const slugify = (value: string) =>
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
  return { id: known?.id ?? (slugify(label) || `category-${product.productCategoryId}`), label };
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

function fromApi(product: ApiProduct, images: ApiProductImage[]): Product {
  const local = findLocalProduct(product.name);
  const category = categoryFromApi(product);
  const apiImages = images
    .filter((img) => img.productId === product.id)
    .sort((a, b) => a.id - b.id)
    .map((img) => apiAssetUrl(img.imagePath))
    .filter((src): src is string => !!src);

  return {
    id: product.id,
    slug: slugify(product.name) || `product-${product.id}`,
    name: product.name,
    category: category.id,
    categoryLabel: category.label,
    images: apiImages.length ? apiImages : local ? fromLocal(local).images : [],
    summary: product.description ?? local?.summary ?? '',
    specs: local?.specs,
  };
}

const localCatalog = (): ProductCatalog => ({
  categories: localCategories.map((c) => ({ id: c.id, label: c.label })),
  products: localProducts.map(fromLocal),
});

export const loadProductCatalog = cache(async (): Promise<ProductCatalog> => {
  if (USE_MOCK_DATA) return localCatalog();

  try {
    const [apiProducts, images] = await Promise.all([
      getAllProducts(),
      getAllProductImages().catch((error) => {
        logApiFailure('Product images failed', error);
        return [] as ApiProductImage[];
      }),
    ]);
    if (!apiProducts.length) return localCatalog();

    const products = apiProducts.map((p) => fromApi(p, images));
    const categories = [...new Map(products.map((p) => [p.category, { id: p.category, label: p.categoryLabel }])).values()];
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
    const details = fromApi(await getProductById(product.id), []);
    return { ...product, ...details, slug: product.slug, images: product.images };
  } catch (error) {
    logApiFailure(`Product ${product.id} failed`, error);
    return product;
  }
}
