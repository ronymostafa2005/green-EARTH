import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const imageSizes = '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px';

export function ProductCard({ product }: { product: Product }) {
  const [image, pack] = product.images;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-3xl border-shimmer sm:rounded-[1.75rem] transition duration-300 group-hover:shadow-[0_24px_50px_-24px_rgb(23_32_15/0.35)]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes={imageSizes}
            className={cn(
              'object-contain p-4 transition sm:p-7 duration-500 group-hover:scale-105',
              pack && 'group-hover:opacity-0',
            )}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-brand-300">
            <Icon name="snowflake" size={40} />
          </span>
        )}
        {pack && (
          <Image
            src={pack}
            alt=""
            fill
            sizes={imageSizes}
            className="scale-90 object-contain p-3 opacity-0 sm:p-6 transition duration-500 group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        <span className="absolute top-4 left-4 rounded-full max-sm:hidden bg-cream px-3 py-1 text-[11px] font-semibold text-ink/60">
          {product.categoryLabel}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 px-1 sm:mt-4 sm:gap-3">
        <h3 className="min-w-0 text-sm font-semibold break-words text-ink sm:text-base">{product.name}</h3>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/10 text-ink transition duration-300 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white max-[359px]:hidden sm:size-9">
          <Icon name="arrowUpRight" size={16} />
        </span>
      </div>
    </Link>
  );
}
