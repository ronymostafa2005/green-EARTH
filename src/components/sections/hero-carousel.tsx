'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Eyebrow } from '@/components/ui/section-heading';
import type { HeroSlide } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const SLIDE_MS = 6500;
const POSTER = '/images/products/strawberries.jpg';
const DEFAULT_SUBTITLE =
  'Demeter Green Earth grows, freezes and exports premium fruits and vegetables from Egypt’s most fertile lands to tables around the world.';

const pad = (n: number) => String(n).padStart(2, '0');

type HeroCarouselProps = {
  slides: HeroSlide[];
  fallbackTitle: React.ReactNode;
  stats: React.ReactNode;
  badge: React.ReactNode;
};

export function HeroCarousel({ slides, fallbackTitle, stats, badge }: HeroCarouselProps) {
  const multi = slides.length > 1;
  const [index, setIndex] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <Container
      className="group/hero grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
      role={multi ? 'region' : undefined}
      aria-roledescription={multi ? 'carousel' : undefined}
      aria-label={multi ? 'Highlights' : undefined}
      onKeyDown={
        multi
          ? (e) => {
              if (e.key === 'ArrowRight') go(index + 1);
              if (e.key === 'ArrowLeft') go(index - 1);
            }
          : undefined
      }
    >
      <div>
        <Eyebrow>Premium IQF · Made in Egypt</Eyebrow>

        <div key={slide?.id ?? 'default'} className={cn(multi && 'animate-fade-up')}>
          <h1 className="mt-7 text-shimmer pb-2 text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl xl:text-7xl">
            {slide?.title ?? fallbackTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">{slide?.subtitle ?? DEFAULT_SUBTITLE}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={slide?.link ?? '/products'} size="lg">
              {slide?.buttonText ?? 'Explore products'}
              <Icon name="arrow" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Request a quote
            </ButtonLink>
          </div>
        </div>

        {stats}
      </div>

      <div className="relative">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-brand-900 sm:aspect-square lg:aspect-[4/5]"
          onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (!multi || touchStart.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
            touchStart.current = null;
          }}
        >
          {slides.length === 0 || (!multi && !slides[0].image) ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={POSTER}
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover"
            >
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
          ) : (
            slides.map((s, i) => {
              const active = i === index;
              return (
                <div
                  key={s.id}
                  aria-hidden={!active}
                  className={cn(
                    'absolute inset-0 transition-[opacity,transform,clip-path] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                    active ? 'z-10 scale-100 opacity-100 [clip-path:inset(0_0_0_0_round_2.5rem)]' : 'z-0 scale-[1.08] opacity-0 [clip-path:inset(6%_6%_6%_6%_round_2.5rem)]',
                  )}
                >
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      priority={i === 0}
                      loading={i === 0 ? undefined : 'eager'}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className={cn('object-cover', active && multi && !reducedMotion && 'animate-ken-burns')}
                    />
                  ) : (
                    <video autoPlay muted loop playsInline preload="metadata" poster={POSTER} className="absolute inset-0 size-full scale-110 object-cover">
                      <source src="/videos/hero.mp4" type="video/mp4" />
                    </video>
                  )}
                </div>
              );
            })
          )}

          <div className="absolute inset-0 z-10 bg-linear-to-t from-brand-950/70 via-transparent to-transparent" />

          {multi && (
            <>
              <div className="absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-brand-950/45 to-transparent" />
              <div className="absolute inset-x-5 top-5 z-20 flex items-center gap-3 sm:inset-x-6 sm:top-6">
                <div className="flex flex-1 gap-1.5">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === index ? 'true' : undefined}
                      className="group relative h-6 flex-1 cursor-pointer"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/30 transition-colors group-hover:bg-white/45">
                        <span
                          className={cn(
                            'absolute inset-0 origin-left rounded-full bg-white',
                            i < index && 'scale-x-100',
                            i > index && 'scale-x-0',
                            i === index &&
                              (reducedMotion
                                ? 'scale-x-100'
                                : 'animate-progress group-has-[:focus-visible]/hero:[animation-play-state:paused]'),
                          )}
                          style={
                            i === index && !reducedMotion
                              ? { animationDuration: `${SLIDE_MS}ms`, ...(tabHidden && { animationPlayState: 'paused' }) }
                              : undefined
                          }
                          onAnimationEnd={i === index ? () => go(index + 1) : undefined}
                        />
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/20 bg-white/15 p-1 text-white backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => go(index - 1)}
                    aria-label="Previous slide"
                    className="grid size-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/25"
                  >
                    <Icon name="arrow" size={16} className="rotate-180" />
                  </button>
                  <span className="min-w-[3.25rem] text-center text-xs font-semibold tracking-wider tabular-nums" aria-hidden>
                    {pad(index + 1)}
                    <span className="text-white/55"> / {pad(slides.length)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    aria-label="Next slide"
                    className="grid size-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/25"
                  >
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="absolute inset-x-5 bottom-5 z-20 flex items-center gap-4 rounded-3xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-700">
              <Icon name="snowflake" size={22} />
            </span>
            <p className="text-sm leading-snug">
              <strong className="block text-base font-semibold">Frozen within hours</strong>
              Individually quick frozen to lock in taste, colour and nutrition.
            </p>
          </div>
        </div>

        {badge}
      </div>
    </Container>
  );
}
