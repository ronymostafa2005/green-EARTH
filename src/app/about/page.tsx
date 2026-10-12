import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { Eyebrow, SectionHeading } from '@/components/ui/section-heading';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { coreValues, promises, stats } from '@/data/company';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'Demeter Green Earth is a trusted Egyptian manufacturer and exporter of premium IQF frozen fruits and vegetables.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About us"
        description="One clear mission — to deliver natural freshness from Egypt’s farms to tables around the world."
      />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <p className="mt-7 text-2xl leading-snug font-medium tracking-tight text-balance sm:text-3xl">
              Demeter Green is a trusted Egyptian company specialized in manufacturing and exporting premium{' '}
              <em className="font-serif font-normal text-brand-600">IQF frozen</em> fruits and vegetables.
            </p>
            <div className="mt-8 space-y-4 leading-relaxed text-ink/65">
              <p>
                Since our establishment, we’ve been driven by one clear mission — to deliver natural freshness from
                Egypt’s farms to tables around the world.
              </p>
              <p>
                Through advanced IQF technology, strict quality control and sustainable sourcing, DGE guarantees
                products that retain their authentic flavour, colour and nutrition.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col rounded-3xl bg-cream p-5">
                  <dt className="text-sm text-ink/55">{stat.label}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-brand-700">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/pages/about.jpg"
              alt="A young tree growing from soil held in a hand"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </Section>

      <Section className="bg-cream">
        <Container>
          <SectionHeading
            eyebrow="What drives us"
            title={
              <>
                Four values, <em>one direction</em>
              </>
            }
            description="Guided by our values, we continuously expand our reach and strengthen long-term partnerships across global markets."
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value) => (
              <li key={value.title} className="rounded-[2rem] bg-white p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon name={value.icon} size={22} />
                </span>
                <h3 className="mt-10 text-xl font-semibold">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/60">{value.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            align="start"
            eyebrow="Our promise"
            title={
              <>
                Quality you can taste, <em>prices that make sense</em>
              </>
            }
          />
          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {promises.map((promise, i) => (
              <li key={promise.title} className="border-t border-ink/10 pt-6">
                <span className="font-serif text-3xl text-brand-600 italic">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{promise.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/60">{promise.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
