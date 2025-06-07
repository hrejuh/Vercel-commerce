import { getOrderById } from '@/lib/supabase/orders'; // Adjust path as needed
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Price from '@/components/price'; // Assuming Price component can be reused

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
  // Data for this specific order page.
  // Revalidation should occur if this order's details or status change.
  // This can be done via:
  // 1. Time-based revalidation.
  // 2. On-demand revalidation by specific order ID:
  //    - `revalidatePath('/orders/[orderId]')` - for specific order path
  //    - `revalidateTag('order-[orderId]')` - if using specific tags with Supabase fetch
  //    This would typically be called after an order status is updated by admin or payment webhook.
  const order = await getOrderById(params.orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-4xl lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-y-4 border-b border-neutral-200 pb-6 dark:border-neutral-700 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Order Details
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
            Order ID: {order.id.substring(0,18)}...
          </p>
        </div>
        <div className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">
          Status: <span className="capitalize">{order.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Items Ordered</h2>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {order.items.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
                  {item.product_snapshot?.featuredImage?.url ? (
                    <img
                      src={item.product_snapshot.featuredImage.url}
                      alt={item.product_snapshot.featuredImage.alt || item.product_snapshot.name}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                      <h3>
                        <Link href={`/product/${item.product_snapshot?.handle || item.product_id}`}> {/* Assuming handle in snapshot */}
                           {item.product_snapshot?.name || 'Product Name Unavailable'}
                        </Link>
                      </h3>
                      <Price
                        amount={(item.price_at_purchase * item.quantity).toFixed(2)}
                        currencyCode={item.currency_code_at_purchase}
                        className="ml-4"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                      Price per item: <Price amount={item.price_at_purchase.toFixed(2)} currencyCode={item.currency_code_at_purchase} />
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-gray-500 dark:text-neutral-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-1">
            <div className="rounded-lg border border-neutral-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/30">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order Summary</h2>

                <dl className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600 dark:text-neutral-400">Subtotal (approx.)</dt>
                    {/* This would be more complex if there were discounts/item-specific taxes */}
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        <Price amount={order.total_amount.toFixed(2)} currencyCode={order.currency_code} />
                    </dd>
                    </div>
                    {/* Shipping and Taxes are not detailed in mock, add if available */}
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <dt className="text-base font-medium text-gray-900 dark:text-white">Order total</dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                        <Price amount={order.total_amount.toFixed(2)} currencyCode={order.currency_code} />
                    </dd>
                    </div>
                </dl>
            </div>

            {order.shipping_address && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping Address</h3>
                    <address className="mt-2 not-italic text-gray-500 dark:text-neutral-400">
                    <span className="block">{order.shipping_address.name}</span>
                    <span className="block">{order.shipping_address.street}</span>
                    <span className="block">{`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`}</span>
                    <span className="block">{order.shipping_address.country}</span>
                    </address>
                </div>
            )}
             {order.billing_address && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Address</h3>
                    <address className="mt-2 not-italic text-gray-500 dark:text-neutral-400">
                    <span className="block">{order.billing_address.name}</span>
                    <span className="block">{order.billing_address.street}</span>
                    <span className="block">{`${order.billing_address.city}, ${order.billing_address.state} ${order.billing_address.postal_code}`}</span>
                    <span className="block">{order.billing_address.country}</span>
                    </address>
                </div>
            )}
        </div>
      </div>

      <div className="mt-16">
        <Link href="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          &larr; Back to all orders
        </Link>
      </div>
    </div>
  );
}
