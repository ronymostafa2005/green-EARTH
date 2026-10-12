import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { getCategoryLabel } from '@/data/products';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const imageSizes = '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/5 transition duration-300 group-hover:shadow-[0_24px_50px_-24px_rgb(23_32_15/0.35)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={imageSizes}
          className={cn(
            'object-contain p-7 transition duration-500 group-hover:scale-105',
            product.pack && 'group-hover:opacity-0',
          )}
        />
        {product.pack && (
          <Image
            src={product.pack}
            alt=""
            fill
            sizes={imageSizes}
            className="scale-90 object-contain p-6 opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        <span className="absolute top-4 left-4 rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-ink/60">
          {getCategoryLabel(product.category)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <h3 className="font-semibold text-ink">{product.name}</h3>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/10 text-ink transition duration-300 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
          <Icon name="arrowUpRight" size={16} />
        </span>
      </div>
    </Link>
  );
}
