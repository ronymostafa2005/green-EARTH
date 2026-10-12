import { Icon } from '@/components/ui/icon';
import { loadProductCatalog } from '@/lib/content';

export async function Marquee() {
  const { products } = await loadProductCatalog();
  const names = products.map((p) => p.name);

  return (
    <div aria-hidden className="overflow-hidden bg-brand-900 py-6 text-white">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[...names, ...names].map((name, i) => (
          <span key={i} className="flex items-center gap-10 pr-10 font-serif text-3xl whitespace-nowrap italic">
            {name}
            <Icon name="snowflake" size={18} className="text-brand-400" />
          </span>
        ))}
      </div>
    </div>
  );
}
