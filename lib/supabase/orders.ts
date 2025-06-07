import { SupabaseProduct, getProductByHandle } from './products';
import { SupabaseCart, SupabaseCartItem, clearCart } from './cart'; // Use clearCart from cart.ts

// Define Supabase Order Types
export type SupabaseOrderItem = {
  id: string; // uuid, order_item_id
  order_id: string; // uuid
  product_id: string; // uuid of the product
  quantity: number;
  price_at_purchase: number;
  currency_code_at_purchase: string;
  product_snapshot?: {
    name: string;
    description?: string;
    featuredImage?: { url: string; alt?: string };
    // Add handle if needed for linking from order details
    handle?: string;
  };
  created_at?: string;
};

export type SupabaseOrder = {
  id: string; // uuid, order_id
  user_id: string; // uuid of the user
  total_amount: number;
  currency_code: string;
  status: string;
  shipping_address: any;
  billing_address: any;
  payment_details?: any;
  items: SupabaseOrderItem[];
  created_at?: string;
  updated_at?: string;
};

// --- Mock Data Store ---
let mockOrders: SupabaseOrder[] = [];
let mockOrderItems: SupabaseOrderItem[] = []; // This will store all order items globally for the mock.
let orderIdCounter = 1;
let orderItemIdCounter = 1;

// const MOCK_USER_ID = 'mock-user-123'; // Defined in cart.ts, can be imported or redefined if needed locally

// --- Mock Supabase Order Functions ---

export async function createOrder(
  userId: string,
  cart: SupabaseCart,
  shippingAddress: any,
  billingAddress: any,
  paymentMethod: string = 'mock_payment'
): Promise<SupabaseOrder | null> {
  // In a real application, this client-side mock would be replaced by:
  // const { data, error } = await supabase.functions.invoke('create-order', {
  //   body: { cartId: cart.id, userId, shippingAddress, billingAddress, paymentMethodDetails }
  // });
  // if (error) throw error;
  // return data;

  console.log(`mock: createOrder for userId: ${userId}. Simulating Edge Function call.`);

  // --- Start of logic that would be inside the Edge Function ---
  if (!cart || !cart.items || cart.items.length === 0) {
    console.error("Edge Function mock: Cannot create order from empty or invalid cart");
    // In Edge Function: return { error: "Invalid cart" };
    return null;
  }

  // 1. TODO (Edge Function): Validate product stock for each item in cart.items.
  //    If stock is insufficient for any item, return an error.

  // 2. TODO (Edge Function): Securely calculate final total_amount based on current product prices and cart quantities.
  //    This prevents client-side tampering with prices. For mock, we use cart.total_amount.
  const calculatedTotalAmount = cart.total_amount || 0; // Or recalculate robustly
  const calculatedCurrencyCode = cart.currency_code || 'USD';


  const newOrderId = `mock-order-${orderIdCounter++}`;
  const currentOrderItems: SupabaseOrderItem[] = [];

  for (const cartItem of cart.items) {
    if (!cartItem.product) {
        console.error(`Edge Function mock: Product details missing for cart item ${cartItem.id}. Skipping.`);
        continue;
    }
    const newOrderItem: SupabaseOrderItem = {
      id: `mock-order-item-${orderItemIdCounter++}`,
      order_id: newOrderId,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      price_at_purchase: cartItem.product.price,
      currency_code_at_purchase: cartItem.product.priceRange?.minVariantPrice.currencyCode || calculatedCurrencyCode,
      product_snapshot: {
        name: cartItem.product.name,
        description: cartItem.product.description,
        featuredImage: cartItem.product.featuredImage,
        handle: cartItem.product.handle // Store handle for linking
      },
      created_at: new Date().toISOString(),
    };
    currentOrderItems.push(newOrderItem);
    mockOrderItems.push(newOrderItem); // Add to global mock store of all order items
  }

  if (currentOrderItems.length === 0) {
      console.error("Edge Function mock: No valid items to create order.");
      // In Edge Function: return { error: "No valid items" };
      return null;
  }

  const newOrder: SupabaseOrder = {
    id: newOrderId,
    user_id: userId,
    total_amount: calculatedTotalAmount,
    currency_code: calculatedCurrencyCode,
    status: 'pending_confirmation', // Initial status after payment but before processing
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    payment_details: { method: paymentMethod, transaction_id: `mock_txn_${Date.now()}` },
    items: currentOrderItems, // Items for this specific order
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockOrders.push(newOrder); // Save to mock DB

  // 3. TODO (Edge Function): Clear the user's cart. This would be a DB operation.
  //    For mock, we call the imported clearCart from cart.ts (which operates on its mock store).
  await clearCart(userId);

  // 4. TODO (Edge Function): Trigger order confirmation email (e.g., via Supabase Functions or external service).
  //    Example: await supabase.functions.invoke('send-order-confirmation-email', { body: { orderId: newOrderId } });
  console.log(`Edge Function mock: Order ${newOrderId} created. Would trigger confirmation email.`);

  // --- End of logic that would be inside the Edge Function ---

  return { ...newOrder }; // Return a copy of the created order
}

export async function getOrdersByUserId(userId: string): Promise<SupabaseOrder[]> {
  console.log(`mock: getOrdersByUserId for userId: ${userId}`);
  const userOrders = mockOrders.filter(order => order.user_id === userId);
  return userOrders.map(order => ({
    ...order,
    // Filter global mockOrderItems for items belonging to this specific order
    items: mockOrderItems.filter(item => item.order_id === order.id)
  }));
}

export async function getOrderById(orderId: string): Promise<SupabaseOrder | null> {
  console.log(`mock: getOrderById for orderId: ${orderId}`);
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    return {
      ...order,
      // Filter global mockOrderItems for items belonging to this specific order
      items: mockOrderItems.filter(item => item.order_id === order.id)
    };
  }
  return null;
}
