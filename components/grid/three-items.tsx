import { GridTileImage } from 'components/grid/tile';
// import { getCollectionProducts } from 'lib/shopify'; // Shopify import
// import type { Product } from 'lib/shopify/types'; // Shopify type
import { getAllProducts, SupabaseProduct } from 'lib/supabase/products'; // Supabase import
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: SupabaseProduct; // Use SupabaseProduct type
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          // Ensure featuredImage exists on SupabaseProduct or provide fallback
          src={item.featuredImage?.url || ''}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.name} // Use name from SupabaseProduct
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.name, // Use name from SupabaseProduct
            // Ensure priceRange exists or fallback to product.price
            amount: item.priceRange?.maxVariantPrice?.amount || item.price.toString(),
            currencyCode: item.priceRange?.maxVariantPrice?.currencyCode || 'USD'
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  // Fetch products from Supabase
  // For now, using getAllProducts and taking the first three.
  // This could be a more specific function like getFeaturedProducts() in a real scenario.
  const products = await getAllProducts();

  if (!products || products.length < 3) return null;

  const [firstProduct, secondProduct, thirdProduct] = products.slice(0,3);

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
