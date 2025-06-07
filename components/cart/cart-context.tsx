'use client';

// Import Supabase types
import {
  SupabaseCart,
  SupabaseCartItem,
} from '@/lib/supabase/cart'; // Ensure path is correct
import { SupabaseProduct } from '@/lib/supabase/products'; // Ensure path is correct
import React, {
  createContext,
  use,
  useContext,
  useMemo,
  useOptimistic
} from 'react';

type UpdateType = 'plus' | 'minus' | 'delete';

// Updated CartAction to use Supabase types
type CartAction =
  | {
      type: 'UPDATE_ITEM';
      payload: { cartItemId: string; updateType: UpdateType, productPrice?: number }; // productPrice for optimistic cost update
    }
  | {
      type: 'ADD_ITEM';
      payload: { product: SupabaseProduct; quantity: number };
    };

// CartContextType now uses SupabaseCart
type CartContextType = {
  cartPromise: Promise<SupabaseCart | undefined | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);


// Updated optimisticUpdateCartItem helper for SupabaseCartItem
function optimisticUpdateSupabaseCartItem(
  item: SupabaseCartItem,
  updateType: UpdateType,
): SupabaseCartItem | null {
  if (updateType === 'delete') return null;

  const newQuantity = updateType === 'plus' ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity <= 0) return null; // Remove if quantity is 0 or less

  return {
    ...item,
    quantity: newQuantity,
    // Note: item.product details (like price) are assumed to be present for accurate optimistic updates.
    // If not, the cart total calculation might be slightly off until server sync.
  };
}

// Updated optimisticCreateOrUpdateSupabaseCartItem helper for Supabase
function optimisticCreateOrUpdateSupabaseCartItem(
  existingItem: SupabaseCartItem | undefined,
  product: SupabaseProduct,
  quantity: number,
  cartId: string // cartId is needed for new items
): SupabaseCartItem {
  const newQuantity = (existingItem ? existingItem.quantity : 0) + quantity;

  return {
    id: existingItem?.id || `optimistic-item-${product.id}-${Date.now()}`, // Placeholder ID for new items
    cart_id: existingItem?.cart_id || cartId,
    product_id: product.id,
    quantity: newQuantity,
    product: product, // Embed product details
    created_at: existingItem?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Updated updateSupabaseCartTotals for SupabaseCart
function updateSupabaseCartTotals(
  items: SupabaseCartItem[]
): Pick<SupabaseCart, 'total_items' | 'total_amount' | 'currency_code'> {
  const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
  let total_amount = 0;
  let currency_code = 'USD'; // Default currency

  items.forEach(item => {
    if (item.product) {
      total_amount += (item.product.price || 0) * item.quantity;
      // Attempt to get currency code from the first available product
      if (currency_code === 'USD' && item.product.priceRange?.minVariantPrice?.currencyCode) {
        currency_code = item.product.priceRange.minVariantPrice.currencyCode;
      }
    }
  });

  if (items.length > 0 && items[0]?.product?.priceRange?.minVariantPrice?.currencyCode) {
     currency_code = items[0].product.priceRange.minVariantPrice.currencyCode;
  }


  return {
    total_items,
    total_amount,
    currency_code
  };
}

// Updated createEmptyCart for SupabaseCart
function createEmptySupabaseCart(): SupabaseCart {
  return {
    id: `optimistic-empty-cart-${Date.now()}`, // Optimistic ID
    user_id: null, // Or a mock user ID if known
    items: [],
    total_items: 0,
    total_amount: 0,
    currency_code: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Updated cartReducer for SupabaseCart
function cartReducer(state: SupabaseCart | undefined | null, action: CartAction): SupabaseCart {
  const currentCart = state || createEmptySupabaseCart();

  switch (action.type) {
    case 'UPDATE_ITEM': {
      const { cartItemId, updateType } = action.payload;
      const updatedItems = currentCart.items
        .map((item) =>
          item.id === cartItemId
            ? optimisticUpdateSupabaseCartItem(item, updateType)
            : item
        )
        .filter(Boolean) as SupabaseCartItem[];

      const totals = updateSupabaseCartTotals(updatedItems);
      return {
        ...currentCart,
        items: updatedItems,
        ...totals
      };
    }
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      // Ensure currentCart.id is valid, otherwise this optimistic item won't have a real cart_id
      const cartIdForNewItem = currentCart.id.startsWith('optimistic-') ? 'unknown-cart' : currentCart.id;

      const existingItem = currentCart.items.find(
        (item) => item.product_id === product.id
      );
      const updatedItem = optimisticCreateOrUpdateSupabaseCartItem(
        existingItem,
        product,
        quantity,
        cartIdForNewItem
      );

      const updatedItems = existingItem
        ? currentCart.items.map((item) =>
            item.product_id === product.id ? updatedItem : item
          )
        : [...currentCart.items, updatedItem];

      const totals = updateSupabaseCartTotals(updatedItems);
      return {
        ...currentCart,
        items: updatedItems,
        ...totals
      };
    }
    default:
      // Ensure that the reducer always returns a state that matches SupabaseCart type.
      // If currentCart could be null/undefined from initial state, ensure createEmptySupabaseCart() is called.
      return currentCart || createEmptySupabaseCart();
  }
}

export function CartProvider({
  children,
  cartPromise
}: {
  children: React.ReactNode;
  cartPromise: Promise<SupabaseCart | undefined | null>; // Uses SupabaseCart
}) {
  return (
    <CartContext.Provider value={{ cartPromise }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  const initialCart = use(context.cartPromise);
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart, // Can be SupabaseCart | undefined | null
    cartReducer
  );

  // Renamed for clarity and updated signature
  const optimisticUpdateItem = (cartItemId: string, updateType: UpdateType) => {
    // For more accurate cost in optimistic update, might need productPrice if not in item.product
    updateOptimisticCart({
      type: 'UPDATE_ITEM',
      payload: { cartItemId, updateType }
    });
  };

  // Renamed for clarity and updated signature
  const optimisticAddItem = (product: SupabaseProduct, quantity: number = 1) => {
    updateOptimisticCart({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  return useMemo(
    () => ({
      cart: optimisticCart, // This will be SupabaseCart | undefined | null
      updateCartItem: optimisticUpdateItem,
      addCartItem: optimisticAddItem
    }),
    [optimisticCart]
  );
}
