import { LoadingDots } from 'components/loading-dots'; // Optional, can use simple pulse too

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="animate-pulse">
        {/* Product Gallery Skeleton */}
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-800">
              {/* Optional: add a simple icon or indicator here */}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
              <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
              <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
            </div>
          </div>
          {/* Product Description Skeleton */}
          <div className="mt-8 basis-full lg:mt-0 lg:basis-2/6">
            <div className="mb-6 h-10 w-3/4 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* Title */}
            <div className="mb-4 h-8 w-1/4 rounded-full bg-gray-300 dark:bg-neutral-700"></div> {/* Price */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-800"></div>
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-800"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Description lines */}
            </div>
            <div className="mt-8 h-12 w-full rounded-full bg-gray-300 dark:bg-neutral-700"></div> {/* Add to Cart button */}
          </div>
        </div>

        {/* Related Products Skeleton (optional, could be simpler) */}
        <div className="py-8">
          <div className="mb-4 h-8 w-1/3 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* "Related Products" title */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
