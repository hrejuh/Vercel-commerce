import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
// import { Product } from 'lib/shopify/types'; // Shopify type
import { SupabaseProduct } from 'lib/supabase/products'; // Supabase type
import Link from 'next/link';

export default function ProductGridItems({ products }: { products: SupabaseProduct[] }) { // Use SupabaseProduct[]
  return (
    <>
      {products.map((product) => (
        <Grid.Item key={product.handle} className="animate-fadeIn">
          <Link
            className="relative inline-block h-full w-full"
            href={`/product/${product.handle}`}
            prefetch={true}
          >
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
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
