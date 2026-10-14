export default function PanelLoading() {
  return (
    <div className="animate-pulse" aria-busy>
      <div className="h-8 w-56 rounded-xl bg-stone-200 dark:bg-white/10" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-lg bg-stone-200/70 dark:bg-white/5" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-40 rounded-3xl bg-white ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
