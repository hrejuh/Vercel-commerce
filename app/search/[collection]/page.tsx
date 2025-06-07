// import { getCollection, getCollectionProducts } from 'lib/shopify'; // Shopify imports
import { getCollectionByHandle, getAllProducts, SupabaseCollection } from 'lib/supabase/products'; // Supabase imports
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { defaultSort, sorting } from 'lib/constants'; // Sorting constants may still be useful

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollectionByHandle(params.collection); // Use Supabase function

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description || collection.description || `${collection.title} products`
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Data for this specific collection/category page.
  // Revalidation should occur if products within this collection change, or if the collection details change.
  // This can be done via:
  // 1. Time-based revalidation.
  // 2. On-demand revalidation:
  //    - `revalidateTag('products')` (general, if any product change could affect collections)
  //    - `revalidateTag('collection-[collectionHandle]')` (if using specific tags for collection data)
  //    - `revalidatePath('/search/[collection]')` for specific collection path.
  //    This would be called after admin actions update products or collection definitions.
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  // const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort; // Sort logic for Supabase would be different

  // Use getAllProducts with collectionHandle. SortKey and reverse are ignored by mock for now.
  const products = await getAllProducts({ collectionHandle: params.collection /*, sortKey, reverse */ });

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this collection`}</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </section>
  );
}
