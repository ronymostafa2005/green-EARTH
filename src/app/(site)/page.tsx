import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CertificateGrid } from '@/components/sections/certificate-grid';
import { CtaSection } from '@/components/sections/cta-section';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { Hero } from '@/components/sections/hero';
import { Marquee } from '@/components/sections/marquee';
import { ProcessSteps } from '@/components/sections/process-steps';
import { WhyUs } from '@/components/sections/why-us';
import { pageMetadata } from '@/lib/site-content';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('home', {});
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <WhyUs />
      <FeaturedProducts />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Certified for global markets"
            title={
              <>
                Food safety you can <em>trust</em>
              </>
            }
            description="Our facilities follow the highest international food safety standards, with full traceability on every batch."
          />
          <div className="mt-14">
            <CertificateGrid />
          </div>
        </Container>
      </Section>

      <ProcessSteps />
      <CtaSection />
    </>
  );
}
