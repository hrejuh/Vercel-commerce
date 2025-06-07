import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { defaultSort, sorting } from 'lib/constants'; // Sorting constants may still be useful
// import { getProducts } from 'lib/shopify'; // Shopify import
import { getAllProducts, SupabaseProduct } from 'lib/supabase/products'; // Supabase import

export const metadata = {
  title: 'Search',
  description: 'Search for products in the store.'
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Data for this page (all products or filtered/searched products).
  // Revalidation should occur if any product data changes or new products are added.
  // This can be done via:
  // 1. Time-based revalidation.
  // 2. On-demand revalidation using a general 'products' tag: `revalidateTag('products')`.
  //    This would be called after admin actions like creating, updating, or deleting products.
  // If Supabase fetch were using specific tags for queries (e.g. based on search query),
  // those could also be revalidated.
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = searchParams as { [key: string]: string }; // Keep searchValue for display
  // const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort; // Sort logic for Supabase would be different

  // For now, ignore sortKey, reverse, and searchValue for fetching.
  // In a real implementation, getAllProducts would accept these as parameters.
  const products = await getAllProducts();
  const resultsText = products.length > 1 ? 'results' : 'result';

  return (
    <>
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? 'There are no products that match '
            : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : null}
    </>
  );
}
