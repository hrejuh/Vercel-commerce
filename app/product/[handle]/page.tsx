import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GridTileImage } from 'components/grid/tile';
import Footer from 'components/layout/footer';
import { Gallery } from 'components/product/gallery';
import { ProductProvider } from 'components/product/product-context';
import { ProductDescription } from 'components/product/product-description';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants'; // May remove if not applicable to Supabase products
// import { getProduct, getProductRecommendations } from 'lib/shopify'; // Shopify import
import { getProductByHandle, getRelatedProducts, SupabaseProduct } from 'lib/supabase/products'; // Supabase import
// import { Image } from 'lib/shopify/types'; // Shopify type
import Link from 'next/link';
import { Suspense } from 'react';

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductByHandle(params.handle); // Use Supabase function

  if (!product) return notFound();

  // Adjust for SupabaseProduct structure if necessary. Assuming featuredImage and tags exist for now.
  const { url, width, height, alt } = product.featuredImage || { url: '', width: 0, height: 0, alt: '' };
  const indexable = product.tags ? !product.tags.includes(HIDDEN_PRODUCT_TAG) : true;

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt
            }
          ]
        }
      : null
  };
}

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  // Data for this specific product page.
  // Revalidation should occur if this product's details change.
  // This can be done via:
  // 1. Time-based revalidation (e.g., revalidate: 3600 in page config or layout).
  // 2. On-demand revalidation by specific product handle/ID or a general 'products' tag:
  //    - `revalidatePath('/product/[handle]')` - for specific product path
  //    - `revalidateTag('products')` or `revalidateTag('product-[id]')` - if using tags with Supabase fetch
  //    This would typically be called after an admin updates product details.
  const params = await props.params;
  const product = await getProductByHandle(params.handle); // Use Supabase function

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    // Ensure featuredImage and priceRange exist on SupabaseProduct, or handle potential undefined
    image: product.featuredImage?.url || '',
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
      highPrice: product.priceRange?.maxVariantPrice?.amount || product.price.toString(),
      lowPrice: product.priceRange?.minVariantPrice?.amount || product.price.toString()
    }
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              <Gallery
                images={product.images.slice(0, 5).map((image: { url: string; alt?: string }) => ({ // Use Supabase image type
                  src: image.url,
                  altText: image.alt || product.name // Provide a fallback alt text
                }))}
              />
            </Suspense>
          </div>

          <div className="basis-full lg:basis-2/6">
            <Suspense fallback={null}>
              {/* Ensure ProductDescription can handle SupabaseProduct type */}
              <ProductDescription product={product as any} />
            </Suspense>
          </div>
        </div>
        {/* Use product.id for related products, ensure it's the correct ID type */}
        <RelatedProducts id={product.id} />
      </div>
      <Footer />
    </ProductProvider>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getRelatedProducts(id); // Use Supabase function

  if (!relatedProducts.length) return null;

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {relatedProducts.map((product) => (
          <li
            key={product.handle}
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.name, // Use name from SupabaseProduct
                  amount: product.priceRange?.maxVariantPrice?.amount || product.price.toString(),
                  currencyCode: product.priceRange?.maxVariantPrice?.currencyCode || 'USD'
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
