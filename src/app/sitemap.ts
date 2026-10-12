import type { MetadataRoute } from 'next';
import { mainNav, siteConfig } from '@/config/site';
import { loadProductCatalog } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await loadProductCatalog();
  const pages = [...mainNav.map((link) => link.href), '/contact'];
  const productPages = products.map((p) => `/products/${p.slug}`);

  return [...pages, ...productPages].map((path) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified: new Date(),
  }));
}
