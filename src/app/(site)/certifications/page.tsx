import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CertificateGrid } from '@/components/sections/certificate-grid';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { pageMetadata } from '@/lib/site-content';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('certifications', {
    title: 'Certifications',
    description: 'Demeter Green Earth is certified ISO 9001:2015 and ISO 22000, and registered with the U.S. FDA.',
  });
}

export default function CertificationsPage() {
  return (
    <>
      <PageHero
        title="Certifications"
        description="International standards that confirm the quality and safety of every product we ship."
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Trusted standards"
            title={
              <>
                Certified for <em>global markets</em>
              </>
            }
            description="Our certifications confirm that every product leaving our facility meets strict international requirements for quality and food safety."
          />
          <div className="mt-14">
            <CertificateGrid />
          </div>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
