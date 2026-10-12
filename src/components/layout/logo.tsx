import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Demeter Green Earth — home">
      <span className="grid size-12 place-items-center rounded-full bg-white">
        <Image src="/images/logo.png" alt="" width={44} height={44} priority />
      </span>
      <span className="leading-none whitespace-nowrap">
        <span className={cn('block text-base font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-brand-800')}>
          Demeter
        </span>
        <span
          className={cn(
            'mt-1 block text-[10px] font-semibold tracking-[0.24em] uppercase',
            tone === 'light' ? 'text-sand-300' : 'text-sand-500',
          )}
        >
          Green Earth
        </span>
      </span>
    </Link>
  );
}
