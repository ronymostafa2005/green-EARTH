import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import type { NavLink } from '@/types';

type PageHeroProps = {
  title: string;
  description?: string;
  crumbs?: NavLink[];
  image?: string;
};

export function PageHero({ title, description, crumbs = [], image = '/images/pages/header.jpg' }: PageHeroProps) {
  return (
    <Container className="pt-6">
      <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-950 px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <Image src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-950/80 to-brand-950/10" />

        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-white/55">
            {[{ href: '/', label: 'Home' }, ...crumbs].map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Link href={crumb.href} className="transition-colors hover:text-white">
                  {crumb.label}
                </Link>
                <span aria-hidden>/</span>
              </li>
            ))}
            <li aria-current="page" className="text-white">
              {title}
            </li>
          </ol>
        </nav>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">{description}</p>}
      </div>
    </Container>
  );
}
