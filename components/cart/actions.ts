'use server';

import { TAGS } from 'lib/constants';
// Shopify imports commented out
// import {
//   addToCart as shopifyAddToCart,
//   createCart as shopifyCreateCart,
//   getCart as shopifyGetCart,
//   removeFromCart as shopifyRemoveFromCart,
//   updateCart as shopifyUpdateCart
// } from 'lib/shopify';
import {
  getOrCreateCartForUser,
  addToCart,
  removeFromCart,
  updateCartItemQuantity as supabaseUpdateCartItemQuantity,
  SupabaseCartItem, // Import SupabaseCartItem if needed for type hints
  clearCart as supabaseClearCart // Import the new clearCart function
} from '@/lib/supabase/cart'; // Adjusted path assuming cart.ts is in lib/supabase
import { revalidateTag } from 'next/cache';
// import { cookies } from 'next/headers'; // cookies might not be needed for Supabase cart ID
// import { redirect } from 'next/navigation'; // redirect for checkout is Shopify specific

const MOCK_USER_ID = 'mock-user-123'; // Define or import MOCK_USER_ID

export async function addItem(
  prevState: any,
  productId: string | undefined // Changed from selectedVariantId to productId
) {
  if (!productId) {
    return 'Error: Product ID is required.';
  }

  try {
    const cart = await getOrCreateCartForUser(MOCK_USER_ID);
    if (!cart) {
      return 'Error: Could not get or create cart.';
    }
    await addToCart(cart.id, productId, 1);
    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return 'Error adding item to cart.';
  }
}

export async function removeItem(prevState: any, cartItemId: string) { // Changed from merchandiseId to cartItemId
  if (!cartItemId) {
    return 'Error: Cart item ID is required.';
  }
  try {
    // In Supabase, we usually operate directly on cart_item_id
    const success = await removeFromCart(cartItemId);
    if (success) {
      revalidateTag(TAGS.cart);
    } else {
      return 'Error removing item or item not found.';
    }
  } catch (e) {
    console.error(e);
    return 'Error removing item from cart.';
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    cartItemId: string; // Changed from merchandiseId to cartItemId
    quantity: number;
  }
) {
  const { cartItemId, quantity } = payload;

  if (!cartItemId) {
    return 'Error: Cart item ID is required.';
  }

  try {
    // Supabase updateCartItemQuantity handles quantity <= 0 by removing the item.
    const updatedItem = await supabaseUpdateCartItemQuantity(cartItemId, quantity);
    // No specific error if item not found and quantity > 0, as it wouldn't update anything.
    // The function returns null if item not found or removed.
    if (quantity > 0 && !updatedItem) {
      // This case means the item wasn't found to update.
      // Unlike Shopify version, we are not adding if not found during an update.
      // This could be changed if desired by fetching cart, then product, then adding.
       console.warn(`Item with id ${cartItemId} not found for update.`);
      // return 'Error: Item not found for update.'; // Optionally return error
    }
    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return 'Error updating item quantity.';
  }
}

// export async function redirectToCheckout() {
//   // This is Shopify specific. A Supabase solution would involve a different checkout/payment integration.
//   // let cart = await getCart(MOCK_USER_ID);
//   // redirect(cart!.checkoutUrl);
//   console.log("redirectToCheckout is a Shopify specific action.");
//   return "Checkout process needs to be defined for Supabase.";
// }

// export async function createCartAndSetCookie() {
//   // Supabase cart creation is handled by getOrCreateCartForUser.
//   // Cart ID management might differ (e.g., stored in user session or local storage if not DB persisted for guests)
//   // let cart = await createCart(MOCK_USER_ID);
//   // (await cookies()).set('cartId', cart.id!);
//   console.log("createCartAndSetCookie is a Shopify specific action.");
// }
