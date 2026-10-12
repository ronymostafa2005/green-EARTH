'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductGallery({ product }: { product: Product }) {
  const images = [
    { src: product.image, label: 'Product' },
    ...(product.pack ? [{ src: product.pack, label: 'Packaging' }] : []),
  ];
  const [current, setCurrent] = useState(0);
  const image = images[current];

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-cream">
        <Image
          key={image.src}
          src={image.src}
          alt={`${product.name} — ${image.label.toLowerCase()}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="animate-fade-in object-contain p-10 mix-blend-multiply"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Show ${img.label.toLowerCase()}`}
              aria-pressed={i === current}
              className={cn(
                'relative size-20 overflow-hidden rounded-2xl bg-cream ring-2 transition',
                i === current ? 'ring-brand-500' : 'ring-transparent hover:ring-ink/10',
              )}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-contain p-2 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
