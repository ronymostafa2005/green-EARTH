import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Icon, type IconName } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { markets } from '@/data/company';
import { cn } from '@/lib/utils';

function FeatureCard({ icon, title, text, className }: { icon: IconName; title: string; text: string; className: string }) {
  return (
    <article className={cn('flex flex-col justify-between gap-10 rounded-[2rem] p-8', className)}>
      <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-700">
        <Icon name={icon} size={22} />
      </span>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 leading-relaxed text-ink/60">{text}</p>
      </div>
    </article>
  );
}

export function WhyUs() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            align="start"
            eyebrow="Why Demeter Green"
            title={
              <>
                From fertile land to your freezer, <em>without compromise</em>
              </>
            }
          />
          <p className="max-w-sm leading-relaxed text-ink/60">
            Every product we export reflects our dedication to quality and freshness — the true essence of Egypt’s
            fertile lands.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(250px,auto))]">
          <article className="relative min-h-[420px] overflow-hidden sm:min-h-[340px] rounded-[2rem] md:col-span-2 lg:row-span-2">
            <Image
              src="/images/pages/quality.jpg"
              alt="A basket of fresh Egyptian vegetables"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-brand-950/90 via-brand-950/40 to-transparent sm:via-brand-950/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <h3 className="text-2xl font-semibold sm:text-3xl">Premium Egyptian quality</h3>
              <p className="mt-3 max-w-md leading-relaxed text-white/75">
                We select the finest crops from Egypt’s most fertile lands, harvested at exactly the right moment.
              </p>
            </div>
          </article>

          <FeatureCard
            icon="snowflake"
            title="Advanced IQF"
            text="Freshness, flavour and texture perfectly preserved."
            className="bg-brand-50"
          />
          <FeatureCard
            icon="shield"
            title="Strict quality control"
            text="Certified processes from farm to freezer."
            className="bg-sand-100"
          />

          <article className="flex flex-col justify-between gap-10 rounded-[2rem] bg-brand-900 p-8 text-white md:col-span-2">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold">Global experience</h3>
                <p className="mt-2 max-w-sm leading-relaxed text-white/65">
                  A trusted exporter across four regions — and reaching new markets every season.
                </p>
              </div>
              <Icon name="globe" size={40} className="shrink-0 text-brand-400" />
            </div>
            <ul className="flex flex-wrap gap-2">
              {markets.map((market) => (
                <li key={market} className="rounded-full border border-white/15 px-4 py-2 text-sm">
                  {market}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Container>
    </Section>
  );
}
