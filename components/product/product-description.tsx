import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
// import { Product } from 'lib/shopify/types'; // Shopify type
import { SupabaseProduct } from 'lib/supabase/products'; // Supabase type
import { VariantSelector } from './variant-selector'; // This will also need update later

export function ProductDescription({ product }: { product: SupabaseProduct }) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.name}</h1> {/* Changed from product.title */}
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price
            // Assuming priceRange is available and has maxVariantPrice for now
            // Fallback to product.price if priceRange is not defined
            amount={product.priceRange?.maxVariantPrice?.amount || product.price.toString()}
            currencyCode={product.priceRange?.maxVariantPrice?.currencyCode || 'USD'}
          />
        </div>
      </div>
      {/*
        VariantSelector will receive product.options and product.variants.
        Its performance will depend on its internal implementation if/when fully migrated
        to handle Supabase product variants.
        If options/variants structures become complex and are derived, useMemo might be needed for them.
      */}
      <VariantSelector options={product.options || []} variants={product.variants || []} />
      {product.description ? ( // Changed from product.descriptionHtml
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          // Assuming description is plain text. If it's HTML, this is fine.
          // If it's markdown, a markdown parser would be needed here.
          html={product.description}
        />
      ) : null}
      {/* AddToCart will also need to be updated to handle SupabaseProduct */}
      <AddToCart product={product as any} /> {/* Cast product to any for now */}
    </>
  );
}
