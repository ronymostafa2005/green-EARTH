import { cn } from '@/lib/utils';

const buttonVariants = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400',
  secondary:
    'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-white/5 dark:text-stone-200 dark:ring-white/10 dark:hover:bg-white/10',
  ghost: 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dangerGhost: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
};

const buttonSizes = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
  icon: 'size-9',
};

export function adminButton({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: keyof typeof buttonVariants; size?: keyof typeof buttonSizes; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-55 [&_svg]:shrink-0',
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );
}

export const inputStyles =
  'w-full rounded-xl border border-stone-200/90 bg-[#fbfcf9] px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:hover:border-white/20';

/** Raised card on the tinted page background. */
export const surface =
  'bg-white shadow-[0_1px_2px_rgb(19_33_13/0.04),0_10px_30px_-18px_rgb(19_33_13/0.22)] ring-1 ring-brand-950/[0.06] dark:bg-[#171a14] dark:shadow-none dark:ring-white/[0.06]';
