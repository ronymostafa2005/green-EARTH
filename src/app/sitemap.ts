import type { MetadataRoute } from 'next';
import { mainNav, siteConfig } from '@/config/site';
import { products } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...mainNav.map((link) => link.href), '/contact'];
  const productPages = products.map((p) => `/products/${p.slug}`);

  return [...pages, ...productPages].map((path) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified: new Date(),
  }));
}
