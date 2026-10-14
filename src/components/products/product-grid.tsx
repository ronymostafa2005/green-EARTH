'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';
import type { Product, ProductCategory } from '@/types';

type ProductGridProps = {
  products: Product[];
  categories: ProductCategory[];
  limit?: number;
  syncUrl?: boolean;
};

export function ProductGrid({ products, categories, limit, syncUrl = false }: ProductGridProps) {
  const [active, setActive] = useState('all');
  const filters = [{ id: 'all', label: 'All' }, ...categories];

  useEffect(() => {
    if (!syncUrl) return;
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (fromUrl && categories.some((c) => c.id === fromUrl)) setActive(fromUrl);
  }, [syncUrl, categories]);

  function select(id: string) {
    setActive(id);
    if (syncUrl) {
      window.history.replaceState(null, '', id === 'all' ? window.location.pathname : `?category=${id}`);
    }
  }

  const count = (id: string) => (id === 'all' ? products.length : products.filter((p) => p.category === id).length);
  const filtered = active === 'all' ? products : products.filter((p) => p.category === active);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  if (!products.length) {
    return (
      <p className="rounded-3xl bg-white px-6 py-14 text-center text-ink/60 ring-1 ring-ink/5">
        Our product range is being updated — please check back soon or contact us for the current availability.
      </p>
    );
  }

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
