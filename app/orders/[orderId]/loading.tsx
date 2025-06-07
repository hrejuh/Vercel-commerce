export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-16 sm:px-6 lg:max-w-4xl lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col items-start justify-between gap-y-4 border-b border-neutral-200 pb-6 dark:border-neutral-700 md:flex-row md:items-center">
        <div>
          <div className="mb-2 h-9 w-3/4 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* Order Details Title */}
          <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Order ID */}
        </div>
        <div className="h-8 w-1/4 rounded-md bg-gray-200 dark:bg-neutral-800"></div> {/* Status Badge */}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
        {/* Items Ordered Skeleton */}
        <div className="md:col-span-2">
          <div className="mb-4 h-7 w-1/3 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* "Items Ordered" Title */}
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {Array(2).fill(0).map((_, index) => (
                <li key={index} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 rounded-md border border-neutral-200 bg-gray-200 dark:border-neutral-700 dark:bg-neutral-800"></div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="h-6 w-3/4 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* Item Name */}
                    <div className="mt-1 h-4 w-1/2 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Item Price per item */}
                    <div className="mt-auto h-4 w-1/4 rounded bg-gray-200 dark:bg-neutral-800 self-start"></div> {/* Qty */}
                  </div>
                  <div className="ml-4 h-6 w-1/4 rounded bg-gray-300 dark:bg-neutral-700 self-start"></div> {/* Item Total Price */}
                </li>
              ))}
          </ul>
        </div>

        {/* Order Summary Skeleton */}
        <div className="md:col-span-1">
          <div className="rounded-lg border border-neutral-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/30">
            <div className="mb-6 h-7 w-1/2 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* "Order Summary" Title */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Subtotal label */}
                <div className="h-5 w-1/4 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Subtotal value */}
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <div className="h-6 w-1/3 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* Total label */}
                <div className="h-6 w-1/4 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* Total value */}
              </div>
            </div>
          </div>

          {/* Shipping Address Skeleton */}
          <div className="mt-8">
            <div className="mb-2 h-6 w-1/2 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* "Shipping Address" Title */}
            <div className="space-y-1">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-800"></div>
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-800"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-neutral-800"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Back link could also be a skeleton if needed, but often not necessary */}
      <div className="mt-16 h-5 w-1/4 rounded bg-gray-200 dark:bg-neutral-800"></div>
    </div>
  );
}
