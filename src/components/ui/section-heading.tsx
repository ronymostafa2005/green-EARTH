import { cn } from '@/lib/utils';

type Tone = 'dark' | 'light';

export function Eyebrow({ children, tone = 'dark' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase',
        tone === 'light' ? 'bg-white/10 text-sand-200' : 'bg-brand-50 text-brand-700',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'start';
  tone?: Tone;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  const light = tone === 'light';

  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          'mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]',
          '[&_em]:font-serif [&_em]:font-normal [&_em]:italic',
          light ? 'text-white [&_em]:text-sand-300' : 'text-ink [&_em]:text-brand-600',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-5 text-lg leading-relaxed', light ? 'text-white/65' : 'text-ink/60')}>{description}</p>
      )}
    </div>
  );
}
