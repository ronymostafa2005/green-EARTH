import type { Metadata } from 'next';
import { ProductGrid } from '@/components/products/product-grid';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { loadProductCatalog } from '@/lib/content';
import { pageMetadata } from '@/lib/site-content';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products', {
    title: 'Products',
    description: 'IQF frozen fruits, frozen vegetables and vegetables in brine from Demeter Green Earth.',
  });
}

export default async function ProductsPage() {
  const { products, categories } = await loadProductCatalog();

  return (
    <>
      <PageHero
        title="Our products"
        description="Frozen fruits, frozen vegetables and vegetables in brine — hover any product to see its retail packaging."
      />

      <Section>
        <Container>
          <ProductGrid products={products} categories={categories} syncUrl />
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
