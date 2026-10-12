'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';
import { categories, products } from '@/data/products';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

type Filter = Category | 'all';

const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, ...categories];

type ProductGridProps = {
  limit?: number;
  syncUrl?: boolean;
};

export function ProductGrid({ limit, syncUrl = false }: ProductGridProps) {
  const [active, setActive] = useState<Filter>('all');

  useEffect(() => {
    if (!syncUrl) return;
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (filters.some((f) => f.id === fromUrl)) setActive(fromUrl as Filter);
  }, [syncUrl]);

  function select(id: Filter) {
    setActive(id);
    if (syncUrl) {
      window.history.replaceState(null, '', id === 'all' ? window.location.pathname : `?category=${id}`);
    }
  }

  const count = (id: Filter) => (id === 'all' ? products.length : products.filter((p) => p.category === id).length);
  const filtered = active === 'all' ? products : products.filter((p) => p.category === active);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="Product categories" className="inline-flex gap-1 rounded-full bg-white p-1.5 ring-1 ring-ink/5">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active === filter.id}
              onClick={() => select(filter.id)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
                active === filter.id ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink',
              )}
            >
              {filter.label}
              <span className="text-xs opacity-50">{count(filter.id)}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
