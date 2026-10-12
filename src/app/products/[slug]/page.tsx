import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/products/product-card';
import { ProductGallery } from '@/components/products/product-gallery';
import { ButtonLink, buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { siteConfig } from '@/config/site';
import { packingSizes } from '@/data/products';
import { loadProduct, loadProductCatalog } from '@/lib/content';
import { whatsappLink } from '@/lib/utils';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { products } = await loadProductCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.summary,
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await loadProduct((await params).slug);
  if (!product) notFound();

  const { products } = await loadProductCatalog();
  const others = products.filter((p) => p.slug !== product.slug);
  const related = [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, 4);

  return (
    <>
      <Section spacing="compactTop">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/50">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/products" className="hover:text-ink">
                  Products
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <ProductGallery product={product} />

            <div className="lg:pt-6">
              <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
                {product.categoryLabel}
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink/60">{product.summary}</p>

              {product.specs && (
                <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                      <dt className="font-semibold">{spec.label}</dt>
                      <dd className="text-ink/65">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <h2 className="mt-8 text-sm font-semibold">Packing options</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {packingSizes.map((size) => (
                  <li key={size} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium">
                    {size}
                  </li>
                ))}
              </ul>

              <p className="mt-8 flex items-center gap-3 rounded-2xl bg-brand-50 px-5 py-4 text-sm text-brand-900">
                <Icon name="snowflake" size={18} className="text-brand-600" />
                Keep frozen at −18 °C or below
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`/contact?product=${encodeURIComponent(product.name)}`} size="lg">
                  Request a quote
                  <Icon name="arrow" />
                </ButtonLink>
                <a
                  href={whatsappLink(siteConfig.contact.whatsapp, `Hello, I'm interested in ${product.name}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: 'outline', size: 'lg' })}
                >
                  <Icon name="whatsapp" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-cream">
        <Container>
          <SectionHeading
            align="start"
            eyebrow="You may also like"
            title={
              <>
                More from our <em>range</em>
              </>
            }
          />
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
