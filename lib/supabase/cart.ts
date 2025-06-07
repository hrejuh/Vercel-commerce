import { SupabaseProduct, getProductByHandle } from './products'; // Assuming products live here for product details

// Define Supabase Cart Types
export type SupabaseCartItem = {
  id: string; // uuid, cart_item_id
  cart_id: string; // uuid
  product_id: string; // uuid of the product
  quantity: number;
  created_at?: string;
  updated_at?: string;
  // Denormalized product details for easier display
  product?: SupabaseProduct; // Store product details fetched separately
};

export type SupabaseCart = {
  id: string; // uuid, cart_id
  user_id: string | null; // uuid of the user, or null for guest
  created_at?: string;
  updated_at?: string;
  items: SupabaseCartItem[];
  // Calculated fields (could also be done on the fly)
  total_items?: number;
  total_amount?: number;
  currency_code?: string; // Assuming a single currency for now
};

// --- Mock Data Store ---
// In a real scenario, this would interact with Supabase tables.
// For mocking, we'll use in-memory arrays.
let mockCarts: SupabaseCart[] = [];
let mockCartItems: SupabaseCartItem[] = [];
let cartIdCounter = 1;
let cartItemIdCounter = 1;

const MOCK_USER_ID = 'mock-user-123'; // Assume a logged-in user for now

// --- Mock Supabase Cart Functions ---

export async function getCart(userId?: string | null): Promise<SupabaseCart | null> {
  console.log(`mock: getCart for userId: ${userId || MOCK_USER_ID}`);
  let cart = mockCarts.find(c => c.user_id === (userId || MOCK_USER_ID) && c.items !== undefined); // Ensure cart is not considered "cleared"

  if (cart) {
    cart.items = mockCartItems.filter(item => item.cart_id === cart!.id);
    // Simulate fetching product details for each item
    for (const item of cart.items) {
      item.product = await getProductByHandle(item.product_id);
    }
    cart.total_items = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total_amount = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    // Ensure currency_code is set based on items or defaults
    if (cart.items.length > 0 && cart.items[0].product?.priceRange?.minVariantPrice.currencyCode) {
        cart.currency_code = cart.items[0].product.priceRange.minVariantPrice.currencyCode;
    } else if (cart.items.length > 0 && cart.items[0].product?.currency_code) { // Fallback if SupabaseProduct has currency_code
        cart.currency_code = cart.items[0].product.currency_code;
    } else {
        cart.currency_code = 'USD'; // Default if no items or no currency info
    }


    return { ...cart }; // Return a copy
  }
  return null;
}

export async function createCart(userId?: string | null): Promise<SupabaseCart> {
  console.log(`mock: createCart for userId: ${userId || MOCK_USER_ID}`);
  // Check if a cart already exists for the user that might have been "cleared" (items = undefined)
  let existingCart = mockCarts.find(c => c.user_id === (userId || MOCK_USER_ID));
  if (existingCart) {
      console.log("Found existing cart, ensuring it's initialized.")
      existingCart.items = []; // Initialize items if it was cleared
      existingCart.total_items = 0;
      existingCart.total_amount = 0;
      existingCart.updated_at = new Date().toISOString();
      // Reset items in mockCartItems as well for this cartId
      mockCartItems = mockCartItems.filter(item => item.cart_id !== existingCart!.id);
      return {...existingCart};
  }

  const newCartId = `mock-cart-${cartIdCounter++}`;
  const newCart: SupabaseCart = {
    id: newCartId,
    user_id: userId || MOCK_USER_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [],
    total_items: 0,
    total_amount: 0,
    currency_code: 'USD'
  };
  mockCarts.push(newCart);
  return { ...newCart }; // Return a copy
}

export async function addToCart(cartId: string, productId: string, quantity: number): Promise<SupabaseCartItem | null> {
  console.log(`mock: addToCart cartId: ${cartId}, productId: ${productId}, quantity: ${quantity}`);
  const cart = mockCarts.find(c => c.id === cartId);
  if (!cart) {
    console.error("Cart not found");
    return null;
  }
   // Ensure cart.items is initialized
  if (cart.items === undefined) cart.items = [];


  const product = await getProductByHandle(productId);
  if (!product) {
    console.error("Product not found");
    return null;
  }

  let item = mockCartItems.find(i => i.cart_id === cartId && i.product_id === productId);
  if (item) {
    item.quantity += quantity;
    item.updated_at = new Date().toISOString();
  } else {
    item = {
      id: `mock-item-${cartItemIdCounter++}`,
      cart_id: cartId,
      product_id: productId,
      quantity: quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCartItems.push(item);
  }
  return { ...item, product };
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  console.log(`mock: removeFromCart cartItemId: ${cartItemId}`);
  const initialLength = mockCartItems.length;
  mockCartItems = mockCartItems.filter(item => item.id !== cartItemId);
  return mockCartItems.length < initialLength;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<SupabaseCartItem | null> {
  console.log(`mock: updateCartItemQuantity cartItemId: ${cartItemId}, quantity: ${quantity}`);
  const itemIndex = mockCartItems.findIndex(i => i.id === cartItemId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      mockCartItems.splice(itemIndex, 1); // Remove item if quantity is 0 or less
      return null;
    } else {
      const item = mockCartItems[itemIndex];
      item.quantity = quantity;
      item.updated_at = new Date().toISOString();
      const product = await getProductByHandle(item.product_id);
      return { ...item, product };
    }
  }
  console.error("Item not found for update");
  return null;
}

export async function clearCart(userId: string): Promise<boolean> {
  console.log(`mock: clearCart for userId: ${userId}`);
  const cart = mockCarts.find(c => c.user_id === userId);
  if (cart) {
    mockCartItems = mockCartItems.filter(item => item.cart_id !== cart.id);
    // Instead of removing the cart, mark it as empty to simulate clearing.
    // A new cart will be created by getOrCreateCartForUser if needed.
    // Or, to truly "clear" and allow a new one to be made by createCart:
     mockCarts = mockCarts.filter(c => c.id !== cart.id);
    // For mock purposes, effectively removing it and its items is simplest.
    return true;
  }
  return false; // No cart found to clear
}


// Helper to get or create cart for a user
export async function getOrCreateCartForUser(userId?: string | null): Promise<SupabaseCart> {
  let userCart = await getCart(userId || MOCK_USER_ID);
  if (!userCart) {
    userCart = await createCart(userId || MOCK_USER_ID);
  }
  return userCart;
}
