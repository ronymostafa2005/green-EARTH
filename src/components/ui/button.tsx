import Link from 'next/link';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  dark: 'bg-ink text-white hover:bg-brand-800',
  outline: 'border border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-white',
  light: 'bg-white text-brand-900 hover:bg-sand-100',
  glass: 'border border-white/30 text-white backdrop-blur-sm hover:bg-white hover:text-brand-900',
};

const sizes = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-[15px]',
};

type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
};

export function buttonStyles({ variant = 'primary', size = 'md', className }: ButtonStyleProps = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 [&_svg]:size-4',
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & ButtonStyleProps;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />;
}
