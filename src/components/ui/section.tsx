import { cn } from '@/lib/utils';

const paddings = {
  default: 'py-20 sm:py-28',
  tight: 'py-8 sm:py-12',
  compactTop: 'pt-8 pb-20 sm:pt-12 sm:pb-28',
};

type SectionProps = React.ComponentProps<'section'> & {
  spacing?: keyof typeof paddings;
};

export function Section({ spacing = 'default', className, ...props }: SectionProps) {
  return <section className={cn(paddings[spacing], className)} {...props} />;
}
