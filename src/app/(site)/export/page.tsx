import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaSection } from '@/components/sections/cta-section';
import { MediaChecklist, MediaSplit } from '@/components/sections/media-split';
import { PageHero } from '@/components/sections/page-hero';
import { ProcessSteps } from '@/components/sections/process-steps';
import { exportReasons, markets } from '@/data/company';
import { getSiteSection, pageMetadata } from '@/lib/site-content';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('export', {
    title: 'Export & Production',
    description: 'Harvested at the right moment and frozen within hours — premium Egyptian produce exported worldwide.',
  });
}

export default async function ExportPage() {
  const section = await getSiteSection('export');
  const paragraphs = section?.paragraphs.length
    ? section.paragraphs
    : [
        'Every product we export reflects our dedication to quality and freshness. Our fruits and vegetables retain their authentic taste, colour and nutrition from the field to your warehouse.',
      ];
  const reasons = section?.items.length ? section.items.map((item) => ({ title: item.title, text: item.description, icon: item.icon })) : exportReasons;

  return (
    <>
      <PageHero
        title="Export & Production"
        description="Harvested at the right moment and frozen within hours — the true essence of Egypt’s fertile lands."
      />

      <MediaSplit
        image={section?.image ?? '/images/pages/export.jpg'}
        imageAlt="Bags of frozen mixed vegetables"
        eyebrow="Export"
        title={
          section?.title ?? (
            <>
              Why partners choose <em>Demeter Green</em>
            </>
          )
        }
      >
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <MediaChecklist items={reasons} />
      </MediaSplit>

      <ProcessSteps />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Where we ship"
            title={
              <>
                Trusted in markets <em>worldwide</em>
              </>
            }
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {markets.map((market) => (
              <li key={market} className="flex items-center gap-4 rounded-[1.75rem] bg-cream p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-700">
                  <Icon name="globe" size={22} />
                </span>
                <span className="text-lg font-semibold">{market}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
