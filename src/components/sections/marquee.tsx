import { Icon } from '@/components/ui/icon';
import { loadProductCatalog } from '@/lib/content';

const HIGHLIGHTS = ['Premium IQF', 'Grown in Egypt', 'Frozen within hours', 'ISO 22000 certified', 'Shipped worldwide', 'Fruits & vegetables'];
const MIN_ITEMS = 8;

export async function Marquee() {
  const { products } = await loadProductCatalog();
  const base = products.length ? products.map((p) => p.name) : HIGHLIGHTS;
  const names = Array.from({ length: Math.ceil(MIN_ITEMS / base.length) }, () => base).flat();

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
