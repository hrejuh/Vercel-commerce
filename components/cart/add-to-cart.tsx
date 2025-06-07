'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
// import { useProduct } from 'components/product/product-context'; // Variant selection context
// import { Product, ProductVariant } from 'lib/shopify/types'; // Shopify types
import { SupabaseProduct } from '@/lib/supabase/products'; // Supabase type (ensure path is correct)
import { useActionState } from 'react';
// import { useCart } from './cart-context'; // Client-side cart context, may need update

function SubmitButton({
  availableForSale,
  productId // Changed from selectedVariantId
}: {
  availableForSale: boolean;
  productId: string | undefined; // Product ID for Supabase
}) {
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white';
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  // Simplified: if there's no productId (e.g. product itself is not loaded), disable.
  // Variant specific logic removed for now.
  if (!productId) {
    return (
      <button
        aria-label="Product not available"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        'hover:opacity-90': true
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: SupabaseProduct }) { // Use SupabaseProduct
  // const { variants, availableForSale } = product; // availableForSale from SupabaseProduct
  const availableForSale = product.availableForSale !== undefined ? product.availableForSale : (product.stock !== undefined ? product.stock > 0 : true);
  // const { addCartItem } = useCart(); // Client context, handle later
  // const { state } = useProduct(); // Variant selection context, removed for simplification
  const [message, formAction] = useActionState(addItem, null);

  // Simplified: using the main product ID. Variant logic is removed.
  // In a full implementation, variant selection would need to be handled here
  // and a productId (which could be a variant_id if your Supabase schema has variants as separate product entries)
  // would be determined. For now, product.id is the SupabaseProduct's main ID.
  const productId = product.id;

  // Bind the productId to the server action
  const addItemActionWithProductId = formAction.bind(null, productId);

  return (
    <form
      action={async () => {
        // Client-side optimistic update logic via addCartItem would need adjustment
        // For now, focusing on server action.
        // if (finalVariant && product) { // finalVariant is no longer determined here
        //   addCartItem(finalVariant, product); // This would need Supabase types
        // }
        await addItemActionWithProductId();
      }}
    >
      <SubmitButton
        availableForSale={availableForSale}
        productId={productId} // Pass productId
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
