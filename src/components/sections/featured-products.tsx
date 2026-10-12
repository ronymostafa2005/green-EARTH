import Link from 'next/link';
import { ProductGrid } from '@/components/products/product-grid';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';

export function FeaturedProducts() {
  return (
    <Section className="bg-cream">
      <Container>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="start"
            eyebrow="Our range"
            title={
              <>
                Fresh from the field, <em>ready</em> when you are
              </>
            }
          />
          <Link
            href="/products"
            className="group inline-flex shrink-0 items-center gap-2 font-semibold text-brand-700 hover:text-brand-800"
          >
            View all products
            <Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGrid limit={8} />
      </Container>
    </Section>
  );
}
