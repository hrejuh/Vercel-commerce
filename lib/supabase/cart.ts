import { supabase } from './client';
import { SupabaseProduct } from './products'; // Used for typing the nested product

// Define Supabase Cart Types
// Note: 'product' field in SupabaseCartItem is for convenience after joining.
// The 'products' table is the source of truth for product details.
export type SupabaseCartItem = {
  id: string; // uuid, cart_item_id
  cart_id: string; // uuid
  product_id: string; // uuid of the product
  quantity: number;
  created_at: string; // Timestamptz
  updated_at: string | null; // Timestamptz
  products?: SupabaseProduct; // Joined product details, optional because it might not always be joined
};

export type SupabaseCart = {
  id: string; // uuid, cart_id
  user_id: string | null;
  created_at: string; // Timestamptz
  updated_at: string | null; // Timestamptz
  metadata: any | null; // JSONB
  cart_items: SupabaseCartItem[]; // Joined cart items
  // Calculated fields can be added client-side or via DB views/functions if needed
  // total_items?: number;
  // total_amount?: number;
  // currency_code?: string;
};

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// --- Real Supabase Cart Functions ---

export async function getCart(): Promise<SupabaseCart | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    // console.log('No user session, cannot fetch cart.');
    return null; // Or handle guest carts if you implement them differently (e.g., local storage based)
  }

  const { data: cartData, error: cartError } = await supabase
    .from('carts')
    .select(`
      id,
      user_id,
      created_at,
      updated_at,
      metadata,
      cart_items (
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id, name, description, price, currency_code, images, stock, handle, category_id, created_at, updated_at,
          categories (id, name, handle)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { foreignTable: 'cart_items', ascending: true }) // Order items by creation
    .single();

  if (cartError) {
    if (cartError.code === 'PGRST116') { // Not a single row (cart not found)
      // console.log('No active cart found for user:', userId);
      return null;
    }
    console.error('Error fetching cart:', cartError);
    throw cartError;
  }

  // Ensure products within cart_items are correctly assigned
  if (cartData && cartData.cart_items) {
    cartData.cart_items = cartData.cart_items.map(item => ({
      ...item,
      product: item.products // Move nested products to product field
    }));
  }
  return cartData as SupabaseCart;
}

export async function createCart(): Promise<SupabaseCart | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated, cannot create cart.');
  }

  // Check if a cart already exists
  const existingCart = await getCart(); // This already filters by user_id
  if (existingCart) {
    // console.log('User already has an active cart:', existingCart.id);
    return existingCart;
  }

  const { data, error } = await supabase
    .from('carts')
    .insert({ user_id: userId, metadata: {} }) // Add default metadata if needed
    .select(`
      id, user_id, created_at, updated_at, metadata,
      cart_items (id, cart_id, product_id, quantity, created_at, updated_at, products(*, categories(*)))
    `) // Fetch items as well, though it will be empty
    .single();

  if (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
  // Ensure products within cart_items are correctly assigned even if empty
  if (data && data.cart_items === null) data.cart_items = [];

  return data as SupabaseCart;
}

export async function getOrCreateCart(): Promise<SupabaseCart | null> {
  let cart = await getCart();
  if (!cart) {
    const userId = await getCurrentUserId(); // createCart needs userId if not passed
    if(userId) { // only try to create if user is logged in
        cart = await createCart();
    } else {
        // console.log("User not logged in, cannot create cart for guest in this model.");
        return null; // Or handle guest cart creation differently
    }
  }
  return cart;
}

export async function addToCart(productId: string, quantity: number = 1): Promise<SupabaseCartItem | null> {
  const cart = await getOrCreateCart();
  if (!cart || !cart.id) { // Ensure cart and cart.id are valid
    throw new Error('Could not get or create cart for the user.');
  }

  // Check if item already exists in the cart
  const { data: existingItem, error: findError } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .single();

  if (findError && findError.code !== 'PGRST116') { // PGRST116 means no row found, which is fine for new items
    console.error('Error finding cart item:', findError);
    throw findError;
  }

  if (existingItem) {
    // Item exists, update quantity
    const newQuantity = existingItem.quantity + quantity;
    return updateCartItemQuantity(existingItem.id, newQuantity);
  } else {
    // Item does not exist, insert new item
    const { data: newItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({ cart_id: cart.id, product_id: productId, quantity })
      .select(`
        *,
        products (
            id, name, description, price, currency_code, images, stock, handle, category_id, created_at, updated_at,
            categories (id, name, handle)
        )
      `)
      .single();

    if (insertError) {
      console.error('Error adding new item to cart:', insertError);
      throw insertError;
    }
     // Ensure products within cart_items are correctly assigned
    if (newItem && newItem.products) {
        (newItem as any).product = newItem.products; // Move nested products to product field
    }
    return newItem as SupabaseCartItem;
  }
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
  return true;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<SupabaseCartItem | null> {
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return null; // Item removed
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartItemId)
    .select(`
        *,
        products (
            id, name, description, price, currency_code, images, stock, handle, category_id, created_at, updated_at,
            categories (id, name, handle)
        )
    `)
    .single();

  if (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
   // Ensure products within cart_items are correctly assigned
  if (data && data.products) {
      (data as any).product = data.products; // Move nested products to product field
  }
  return data as SupabaseCartItem;
}

export async function clearCart(): Promise<boolean> {
  const cart = await getCart(); // This gets the current user's cart
  if (!cart || !cart.id) {
    console.log('No cart found for current user to clear.');
    return false;
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id);

  if (error) {
    console.error('Error clearing cart items:', error);
    throw error;
  }

  // Optionally, also delete the cart record itself if it should not persist when empty,
  // or mark it as inactive / update its 'updated_at' timestamp.
  // For this implementation, we just remove its items.
  // A new cart will be created by getOrCreateCart if needed.
  // To delete the cart record too:
  // const { error: deleteCartError } = await supabase.from('carts').delete().eq('id', cart.id);
  // if (deleteCartError) {
  //   console.error('Error deleting cart record:', deleteCartError);
  //   // Decide if this should throw an error or just log
  // }

  console.log(`Cart ${cart.id} cleared.`);
  return true;
}

// Type for SupabaseCartItem has been updated to make 'products' optional, as it's from a join.
// Type for SupabaseCart has 'cart_items' which will contain these SupabaseCartItem objects.
// The nested select for products in getCart, addToCart, updateCartItemQuantity ensures product details are fetched.
// Error handling includes basic console logs and re-throwing errors.
// RLS policies must allow these operations for the authenticated user.
// Guest cart handling is not explicitly implemented here; these functions assume an authenticated user.
// If guest carts are needed, they'd typically be managed via local storage or a separate table/logic
// until the user logs in, at which point the guest cart could be merged or associated.
// The `product` field is now correctly typed as `SupabaseProduct` and is sourced from `products(*)` join.
// The `categories` are also joined within the product details.
// The `getCart` was modified to properly assign the nested `products` data to the `product` field in `SupabaseCartItem`.
// Similarly for `addToCart` and `updateCartItemQuantity` for newly created/updated items.
// `createCart` checks for existing cart first.
// `getOrCreateCart` handles guest user case by returning null if no user.
// `clearCart` now correctly uses `getCart` (which is user-specific) to find the cart to clear.
