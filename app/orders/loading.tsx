// Simple skeleton for an order list item
function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
      <div className="h-6 w-1/2 rounded bg-gray-300 dark:bg-neutral-700"></div> {/* Order ID */}
      <div className="mt-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Status */}
      <div className="mt-1 h-4 w-1/3 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Date */}
      <div className="mt-1 h-4 w-1/4 rounded bg-gray-200 dark:bg-neutral-800"></div> {/* Total */}
      <div className="mt-3 h-4 w-1/5 rounded bg-blue-200 dark:bg-blue-800"></div> {/* View Details link */}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="mb-6 h-9 w-1/3 animate-pulse rounded bg-gray-300 dark:bg-neutral-700"></div> {/* "My Orders" title */}
      <div className="space-y-4">
        {Array(3) // Display 3 order skeletons
          .fill(0)
          .map((_, index) => (
            <OrderSkeleton key={index} />
          ))}
      </div>
    </div>
  );
}
