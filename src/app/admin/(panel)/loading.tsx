import { surface } from '@/admin/ui/styles';
import { cn } from '@/lib/utils';

export default function PanelLoading() {
  return (
    <div className="animate-pulse" aria-busy>
      <div className="h-8 w-56 rounded-xl bg-stone-300/50 dark:bg-white/10" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-lg bg-stone-300/35 dark:bg-white/5" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={cn('h-40 rounded-3xl', surface)} />
        ))}
      </div>
    </div>
  );
}
