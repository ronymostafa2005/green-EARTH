import { Icon } from '@/components/ui/icon';
import { stats } from '@/data/company';
import { getHeroSlides } from '@/lib/site-content';
import { HeroCarousel } from './hero-carousel';

export async function Hero() {
  const slides = await getHeroSlides();

  return (
    <section className="relative isolate overflow-hidden pt-10 pb-20 sm:pt-16 lg:pb-28">
      <div
        aria-hidden
        className="absolute -top-48 left-1/2 -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
      />

      <HeroCarousel
        slides={slides}
        fallbackTitle={
          <>
            Egypt’s harvest, <em className="text-shimmer font-serif font-normal text-brand-600">frozen</em> at its peak.
          </>
        }
        stats={
          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-ink/10 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="text-sm text-ink/55">{stat.label}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        }
        badge={
          <div className="absolute top-24 -left-6 z-20 hidden items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[0_20px_50px_-20px_rgb(23_32_15/0.35)] sm:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-sand-100 text-sand-500">
              <Icon name="shield" />
            </span>
            <p className="text-sm leading-tight">
              <strong className="block font-semibold">ISO 22000 · FDA</strong>
              <span className="text-ink/55">Certified food safety</span>
            </p>
          </div>
        }
      />
    </section>
  );
}
