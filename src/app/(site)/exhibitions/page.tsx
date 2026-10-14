import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { loadExhibitions } from '@/lib/content';
import { pageMetadata } from '@/lib/site-content';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('exhibitions', {
    title: 'Exhibitions',
    description: 'Meet Demeter Green Earth at international food exhibitions.',
  });
}

export default async function ExhibitionsPage() {
  const exhibitions = await loadExhibitions();

  return (
    <>
      <PageHero
        title="Exhibitions"
        description="We take part in leading food exhibitions to meet our partners and present our latest products."
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Meet us"
            title={
              <>
                Where we’ve <em>been</em>
              </>
            }
          />

          <ul className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
            {exhibitions.map((event) => (
              <li key={event.id} className="group overflow-hidden rounded-[2rem] bg-cream p-3">
                <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-white">
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 440px"
                      className="object-contain p-6 transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex items-end justify-between gap-4 p-5">
                  <div>
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    {event.city && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55">
                        <Icon name="pin" size={15} />
                        {event.city}
                      </p>
                    )}
                  </div>
                  <span className="font-serif text-4xl text-brand-600 italic">{event.year}</span>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
