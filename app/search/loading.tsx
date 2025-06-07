import Grid from 'components/grid';
// Using LoadingDots for a more generic loading indicator if needed elsewhere,
// but for skeleton, direct pulse is fine.
// import { LoadingDots } from 'components/loading-dots';

// Simple skeleton for product grid items
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
      <div className="mt-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Title placeholder */}
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Price placeholder */}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8"> {/* Added container similar to pages */}
      {/* Placeholder for search result text or filters */}
      <div className="mb-8 flex items-center justify-between">
        <div className="h-8 w-1/3 animate-pulse rounded bg-gray-300 dark:bg-neutral-700"></div>
        <div className="h-8 w-1/4 animate-pulse rounded bg-gray-300 dark:bg-neutral-700"></div>
      </div>

      <Grid className="grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {Array(9) // Display 9 skeleton items
          .fill(0)
          .map((_, index) => (
            <Grid.Item key={index}>
              <ProductSkeleton />
            </Grid.Item>
          ))}
      </Grid>
    </div>
  );
}
