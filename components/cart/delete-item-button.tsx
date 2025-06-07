'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { removeItem } from 'components/cart/actions';
// import type { CartItem } from 'lib/shopify/types'; // Shopify type
import type { SupabaseCartItem } from '@/lib/supabase/cart'; // Supabase type (ensure path is correct)
import { useActionState } from 'react';

export function DeleteItemButton({
  item,
  optimisticUpdate
}: {
  item: SupabaseCartItem; // Use SupabaseCartItem type
  optimisticUpdate: any; // This function will need to be aware of SupabaseCartItem structure
}) {
  const [message, formAction] = useActionState(removeItem, null);
  // The removeItem action now expects the cart_item_id directly.
  // SupabaseCartItem has an 'id' field which is the cart_item_id.
  const cartItemId = item.id;
  const removeItemAction = formAction.bind(null, cartItemId);

  return (
    <form
      action={async () => {
        // Ensure optimisticUpdate can handle cartItemId or the SupabaseCartItem structure
        optimisticUpdate(cartItemId, 'delete');
        await removeItemAction();
      }}
    >
      <button
        type="submit"
        aria-label="Remove cart item"
        className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500"
      >
        <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
      </button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
