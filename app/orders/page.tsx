import { getOrdersByUserId } from '@/lib/supabase/orders'; // Adjust path as needed
import Link from 'next/link';
import { Suspense } from 'react';

// Assume a fixed user ID for now, in a real app this would come from session
const MOCK_USER_ID = 'mock-user-123';

async function UserOrdersList() {
  // Data for this page: list of orders for the current user.
  // Revalidation should occur if:
  // 1. A new order is placed by this user.
  // 2. An existing order's status or details change for this user.
  // This can be done via:
  // - `revalidateTag('orders-[userId]')` (if using user-specific tags for order data)
  // - `revalidatePath('/orders')` (to refresh this specific page)
  // These would be called after order creation or status updates.
  const orders = await getOrdersByUserId(MOCK_USER_ID);

  if (!orders || orders.length === 0) {
    return <p>You have no orders yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <Link href={`/orders/${order.id}`} className="hover:underline">
            <h2 className="text-xl font-semibold">Order ID: {order.id.substring(0, 18)}...</h2>
          </Link>
          <p>Status: <span className="font-medium capitalize">{order.status}</span></p>
          <p>Date: {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
          <p>Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code || 'USD' }).format(order.total_amount)}</p>
          <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
            View Details
          </Link>
        </li>
      ))}
    </ul>
  );
}


export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Orders</h1>
      <Suspense fallback={<p>Loading orders...</p>}>
        <UserOrdersList />
      </Suspense>
    </div>
  );
}
