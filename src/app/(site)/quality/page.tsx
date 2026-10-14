import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CertificateGrid } from '@/components/sections/certificate-grid';
import { CtaSection } from '@/components/sections/cta-section';
import { MediaSplit } from '@/components/sections/media-split';
import { PageHero } from '@/components/sections/page-hero';
import { ProcessSteps } from '@/components/sections/process-steps';

export const metadata: Metadata = {
  title: 'Quality',
  description:
    'Every step from sourcing to freezing is monitored to ensure consistent freshness, flavour and full traceability.',
};

export default function QualityPage() {
  return (
    <>
      <PageHero
        title="Quality"
        description="Each batch reflects our promise of excellence and our commitment to safe, premium-quality products."
      />

      <MediaSplit
        image="/images/pages/quality.jpg"
        imageAlt="A basket of fresh vegetables"
        eyebrow="Our standard"
        title={
          <>
            Quality comes <em>first</em> at Demeter Green
          </>
        }
      >
        <p>
          Our production facilities follow the highest international food safety standards, backed by certifications
          such as ISO, BRC and FDA registration.
        </p>
        <p>
          Every step — from sourcing to freezing — is carefully monitored to ensure consistent freshness, flavour and
          full traceability.
        </p>
        <p>
          Each batch reflects our promise of excellence and commitment to delivering safe, premium-quality products
          worldwide.
        </p>
      </MediaSplit>

      <ProcessSteps />

      <Section>
        <Container>
          <SectionHeading eyebrow="Certified" title="Our certifications" />
          <div className="mt-14">
            <CertificateGrid />
          </div>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
