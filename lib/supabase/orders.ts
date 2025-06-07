import { supabase } from './client';
import { SupabaseProduct } from './products';
import { SupabaseCart } from './cart'; // Only needed for type hint in createOrderForEdgeFunction

// --- Type Definitions ---
// Ensure these align with your actual DB schema and RLS policies.
// 'products' in order_items might be populated by a join or fetched separately.

export type SupabaseOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  currency_code_at_purchase: string;
  product_snapshot: any | null; // JSONB
  created_at: string;
  products?: SupabaseProduct; // For joined data
};

export type SupabaseOrder = {
  id: string;
  user_id: string;
  total_amount: number;
  currency_code: string;
  status: string;
  shipping_address: any | null; // JSONB
  billing_address: any | null; // JSONB
  payment_details: any | null; // JSONB
  created_at: string;
  updated_at: string | null;
  order_items: SupabaseOrderItem[]; // For joined data
};

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// --- Real Supabase Order Functions ---

export async function getOrdersByUserId(): Promise<SupabaseOrder[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('No user session, cannot fetch orders.');
    return [];
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      total_amount,
      currency_code,
      status,
      shipping_address,
      billing_address,
      payment_details,
      created_at,
      updated_at,
      order_items (
        id,
        order_id,
        product_id,
        quantity,
        price_at_purchase,
        currency_code_at_purchase,
        product_snapshot,
        created_at,
        products (id, name, handle, images, price, currency_code) -- Select specific product fields needed for order history
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders by user ID:', error);
    throw error;
  }
  // Map 'products' to 'product' field for consistency if needed by UI, or adjust UI.
  if (data) {
    return data.map(order => ({
      ...order,
      order_items: order.order_items.map(item => ({
        ...item,
        product: item.products // Simplified: direct assignment assuming 'products' is singular object due to join.
                               // If 'products' is an array, item.products[0] or similar logic is needed.
                               // Based on schema, product_id in order_items is singular, so join should yield singular product.
      }))
    })) as SupabaseOrder[];
  }
  return [];
}

export async function getOrderById(orderId: string): Promise<SupabaseOrder | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('No user session, cannot fetch order.');
    return null;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      total_amount,
      currency_code,
      status,
      shipping_address,
      billing_address,
      payment_details,
      created_at,
      updated_at,
      order_items (
        id,
        order_id,
        product_id,
        quantity,
        price_at_purchase,
        currency_code_at_purchase,
        product_snapshot,
        created_at,
        products (id, name, handle, images, price, currency_code)
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId) // Ensure user can only fetch their own order
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      console.log(`Order with ID "${orderId}" not found for user "${userId}".`);
      return null;
    }
    console.error(`Error fetching order by ID "${orderId}":`, error);
    throw error;
  }
  // Map 'products' to 'product' field
  if (data && data.order_items) {
    data.order_items = data.order_items.map(item => ({
      ...item,
      product: item.products
    }));
  }
  return data as SupabaseOrder;
}

// This client-side function is now primarily a wrapper to invoke the Edge Function.
// The actual order creation logic (DB inserts, stock updates, etc.)
// is handled within the 'create-order' Supabase Edge Function.
export async function createOrderClientSide(
  cart: SupabaseCart, // Cart object from client-side state/context
  shippingAddress: any,
  billingAddress: any,
  paymentMethodDetails: any // e.g., { method: "razorpay", razorpay_payment_id: "...", ... }
): Promise<{ orderId: string; error: null } | { orderId: null; error: any }> {

  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('User not authenticated. Cannot create order.');
    return { orderId: null, error: new Error('User not authenticated.') };
  }

  if (!cart || !cart.id || !cart.items || cart.items.length === 0) {
    console.error('Cart is empty or invalid.');
    return { orderId: null, error: new Error('Cart is empty or invalid.') };
  }

  console.log("Client: Invoking 'create-order' Edge Function with cartId:", cart.id);

  // The Edge Function 'create-order' is responsible for:
  // 1. Verifying cart ownership and contents against the database.
  // 2. Validating stock.
  // 3. Calculating final amounts securely.
  // 4. Inserting into 'orders' and 'order_items' tables.
  // 5. Decrementing stock.
  // 6. Clearing the cart from the database.
  // 7. Triggering post-order emails (e.g., confirmation).

  try {
    const { data, error: functionError } = await supabase.functions.invoke('create-order', {
      body: {
        cartId: cart.id,
        // userId will be available in Edge Function context from JWT
        shippingAddress,
        billingAddress,
        paymentDetails: paymentMethodDetails
      }
    });

    if (functionError) {
      console.error("Error invoking 'create-order' function:", functionError.message);
      // Detailed error might be in functionError.context or functionError.details
      return { orderId: null, error: functionError };
    }

    if (data && data.error) { // Handle application-specific errors returned by the Edge Function
      console.error("Error from 'create-order' function:", data.error);
      return { orderId: null, error: data.error };
    }

    if (data && data.orderId) {
      console.log("Client: 'create-order' Edge Function success. Order ID:", data.orderId);
      // The cart should have been cleared by the Edge Function.
      // Client-side cart state should be updated/refetched based on this.
      return { orderId: data.orderId, error: null };
    } else {
      console.error("Client: 'create-order' Edge Function did not return an orderId or returned an unexpected response.", data);
      return { orderId: null, error: new Error('Unexpected response from order creation service.') };
    }

  } catch (e: any) {
    // This catch block is for network errors or if supabase.functions.invoke itself throws
    console.error("Exception when invoking 'create-order' function:", e.message);
    return { orderId: null, error: e };
  }
}

// Note: The `SupabaseOrderItem` type was updated to use `products?: SupabaseProduct` for the joined data.
// The queries for `getOrdersByUserId` and `getOrderById` now join `order_items` and then `products` within `order_items`.
// Mapping is added to move the nested `products` object to a simpler `product` field in the items for easier use,
// assuming a one-to-one join from order_item to product.
// `createOrderClientSide` is the new name for the client-side function that calls the Edge Function.
// The old mock `createOrder` logic is effectively what the 'create-order' Edge Function would do.
// Error handling and user authentication checks are included.
// RLS policies must be in place for users to only access their own orders.
// The fields selected in joins are illustrative; select only what's needed.
// The `payment_details` in `createOrderClientSide` now represents the *verified* payment details.
// The Edge Function `create-order` is assumed to handle cart clearing now.
// `clearCart` function from `cart.ts` is still available if client-side cart clearing is needed for UI before server confirmation.
