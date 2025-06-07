// import { getCollectionProducts } from 'lib/shopify'; // Shopify import
import { getAllProducts, SupabaseProduct } from 'lib/supabase/products'; // Supabase import
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

export async function Carousel() {
  // Fetch products from Supabase.
  // Using getAllProducts for now. This could be a specific function like getCarouselProducts().
  const products = await getAllProducts();

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.name} // Use name from SupabaseProduct
                label={{
                  title: product.name, // Use name from SupabaseProduct
                  // Ensure priceRange exists or fallback to product.price
                  amount: product.priceRange?.maxVariantPrice?.amount || product.price.toString(),
                  currencyCode: product.priceRange?.maxVariantPrice?.currencyCode || 'USD'
                }}
                // Ensure featuredImage exists or provide fallback
                src={product.featuredImage?.url || ''}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
