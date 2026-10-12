import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Eyebrow } from '@/components/ui/section-heading';
import { stats } from '@/data/company';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-10 pb-20 sm:pt-16 lg:pb-28">
      <div
        aria-hidden
        className="absolute -top-48 left-1/2 -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
      />

      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <Eyebrow>Premium IQF · Made in Egypt</Eyebrow>
          <h1 className="mt-7 text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl xl:text-7xl">
            Egypt’s harvest, <em className="font-serif font-normal text-brand-600">frozen</em> at its peak.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
            Demeter Green Earth grows, freezes and exports premium fruits and vegetables from Egypt’s most fertile
            lands to tables around the world.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/products" size="lg">
              Explore products
              <Icon name="arrow" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Request a quote
            </ButtonLink>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-ink/10 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="text-sm text-ink/55">{stat.label}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-brand-900 sm:aspect-square lg:aspect-[4/5]">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/products/strawberries.jpg"
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover"
            >
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-linear-to-t from-brand-950/70 via-transparent to-transparent" />

            <div className="absolute inset-x-5 bottom-5 flex items-center gap-4 rounded-3xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-700">
                <Icon name="snowflake" size={22} />
              </span>
              <p className="text-sm leading-snug">
                <strong className="block text-base font-semibold">Frozen within hours</strong>
                Individually quick frozen to lock in taste, colour and nutrition.
              </p>
            </div>
          </div>

          <div className="absolute top-10 -left-6 hidden items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[0_20px_50px_-20px_rgb(23_32_15/0.35)] sm:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-sand-100 text-sand-500">
              <Icon name="shield" />
            </span>
            <p className="text-sm leading-tight">
              <strong className="block font-semibold">ISO 22000 · FDA</strong>
              <span className="text-ink/55">Certified food safety</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
