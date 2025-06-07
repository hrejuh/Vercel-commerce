'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { updateItemQuantity } from 'components/cart/actions';
// import type { CartItem } from 'lib/shopify/types'; // Shopify type
import type { SupabaseCartItem } from '@/lib/supabase/cart'; // Supabase type (ensure path is correct)
import { useActionState } from 'react';

function SubmitButton({ type }: { type: 'plus' | 'minus' }) {
  return (
    <button
      type="submit"
      aria-label={
        type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'
      }
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
        {
          'ml-auto': type === 'minus'
        }
      )}
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate
}: {
  item: SupabaseCartItem; // Use SupabaseCartItem type
  type: 'plus' | 'minus';
  optimisticUpdate: any; // This function will need to be aware of SupabaseCartItem structure
}) {
  const [message, formAction] = useActionState(updateItemQuantity, null);
  // The updateItemQuantity action now expects { cartItemId, quantity }
  // SupabaseCartItem has an 'id' field which is the cart_item_id.
  const payload = {
    cartItemId: item.id,
    quantity: type === 'plus' ? item.quantity + 1 : item.quantity - 1
  };
  const updateItemQuantityAction = formAction.bind(null, payload);

  return (
    <form
      action={async () => {
        // Ensure optimisticUpdate can handle cartItemId or the SupabaseCartItem structure and type ('plus'/'minus')
        optimisticUpdate(item.id, type, payload.quantity);
        await updateItemQuantityAction();
      }}
    >
      <SubmitButton type={type} />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
