import { cn } from '@/lib/utils';
import { surface } from './styles';

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-[28px] dark:text-white">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-stone-500 dark:text-stone-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('rounded-3xl p-6', surface, className)}>{children}</section>;
}

export function CardTitle({ title, description, action }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2.5 font-semibold before:h-4 before:w-1 before:rounded-full before:bg-brand-500">{title}</h2>
        {description && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
