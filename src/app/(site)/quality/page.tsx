import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CertificateGrid } from '@/components/sections/certificate-grid';
import { CtaSection } from '@/components/sections/cta-section';
import { MediaChecklist, MediaSplit } from '@/components/sections/media-split';
import { PageHero } from '@/components/sections/page-hero';
import { ProcessSteps } from '@/components/sections/process-steps';
import { getSiteSection, pageMetadata } from '@/lib/site-content';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('quality', {
    title: 'Quality',
    description:
      'Every step from sourcing to freezing is monitored to ensure consistent freshness, flavour and full traceability.',
  });
}

const defaultParagraphs = [
  'Our production facilities follow the highest international food safety standards, backed by certifications such as ISO, BRC and FDA registration.',
  'Every step — from sourcing to freezing — is carefully monitored to ensure consistent freshness, flavour and full traceability.',
  'Each batch reflects our promise of excellence and commitment to delivering safe, premium-quality products worldwide.',
];

export default async function QualityPage() {
  const section = await getSiteSection('quality');
  const paragraphs = section?.paragraphs.length ? section.paragraphs : defaultParagraphs;

  return (
    <>
      <PageHero
        title="Quality"
        description="Each batch reflects our promise of excellence and our commitment to safe, premium-quality products."
      />

      <MediaSplit
        image={section?.image ?? '/images/pages/quality.jpg'}
        imageAlt="A basket of fresh vegetables"
        eyebrow="Our standard"
        title={
          section?.title ?? (
            <>
              Quality comes <em>first</em> at Demeter Green
            </>
          )
        }
      >
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
        {!!section?.items.length && (
          <MediaChecklist items={section.items.map((item) => ({ title: item.title, text: item.description, icon: item.icon }))} />
        )}
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
