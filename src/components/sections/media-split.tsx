import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Icon, type IconName } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';

type MediaSplitProps = {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: React.ReactNode;
  reverse?: boolean;
  children: React.ReactNode;
};

export function MediaSplit({ image, imageAlt, eyebrow, title, reverse, children }: MediaSplitProps) {
  return (
    <Section>
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className={cn('relative isolate', reverse && 'lg:order-2')}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div
            aria-hidden
            className={cn('absolute -bottom-5 -z-10 size-48 rounded-[2rem] bg-brand-100', reverse ? '-left-5' : '-right-5')}
          />
        </div>

        <div>
          <SectionHeading align="start" eyebrow={eyebrow} title={title} />
          <div className="mt-6 space-y-4 leading-relaxed text-ink/65">{children}</div>
        </div>
      </Container>
    </Section>
  );
}

export function MediaChecklist({ items }: { items: { title: string; text: string; icon?: IconName }[] }) {
  return (
    <ul className="space-y-4 pt-4">
      {items.map((item) => (
        <li key={item.title} className="flex gap-4">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
            <Icon name={item.icon ?? 'check'} size={14} />
          </span>
          <p>
            <strong className="block font-semibold text-ink">{item.title}</strong>
            {item.text}
          </p>
        </li>
      ))}
    </ul>
  );
}
