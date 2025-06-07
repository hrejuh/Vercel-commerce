'use client';

import clsx from 'clsx';
import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingDots from 'components/loading-dots';
import Price from 'components/price';
import { DEFAULT_OPTION } from 'lib/constants'; // May or may not be relevant for Supabase variants
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { clearCartAction } from './actions'; // Import clearCartAction
import { createOrder as supabaseCreateOrder } from '@/lib/supabase/orders'; // Import createOrder
import { useCart } from './cart-context'; // This context will need to be updated for Supabase
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import OpenCart from './open-cart';

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal() {
  const { cart, updateCartItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // useEffect(() => { // Shopify-specific cart creation
  //   if (!cart) {
  //     // createCartAndSetCookie(); // This would be handled by Supabase logic, perhaps in useCart context
  //   }
  // }, [cart]);

  useEffect(() => {
    // Use total_items from SupabaseCart if available, or calculate from items length
    const currentTotalQuantity = cart?.total_items ?? cart?.items?.length ?? 0;
    if (
      currentTotalQuantity !== quantityRef.current &&
      currentTotalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = currentTotalQuantity;
    }
  }, [isOpen, cart]); // Watch entire cart object for changes

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        {/* Use total_items or items.length for quantity */}
        <OpenCart quantity={cart?.total_items ?? cart?.items?.length} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">My Cart</p>
                <button aria-label="Close cart" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {/* Use cart.items for SupabaseCart */}
              {!cart || !cart.items || cart.items.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4">
                    {/*
                      Consider memoizing sortedCartItems if cart.items can be very large, e.g.:
                      const sortedCartItems = useMemo(() => {
                        if (!cart?.items) return [];
                        return [...cart.items].sort((a, b) =>
                          a.product?.name?.localeCompare(b.product?.name || '') || 0
                        );
                      }, [cart?.items]);
                      Then map over sortedCartItems. For typical cart sizes, this might be premature.
                    */}
                    {cart.items
                      .sort((a, b) => // Sorting on each render, could be memoized if performance becomes an issue.
                        a.product?.name?.localeCompare(b.product?.name || '') || 0
                      )
                      .map((item, i) => {
                        // Simplified URL creation, assuming no complex variant params for now
                        const productUrl = `/product/${item.product?.handle || item.product_id}`;

                        return (
                          <li
                            key={item.id || i} // Use item.id (cart_item_id)
                            className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                          >
                            <div className="relative flex w-full flex-row justify-between px-1 py-4">
                              <div className="absolute z-40 -ml-1 -mt-2">
                                <DeleteItemButton
                                  item={item} // item is SupabaseCartItem
                                  optimisticUpdate={updateCartItem} // This function needs to be adapted
                                />
                              </div>
                              <div className="flex flex-row">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                  {item.product?.featuredImage?.url && (
                                    <Image
                                      className="h-full w-full object-cover"
                                      width={64}
                                      height={64}
                                      alt={item.product?.featuredImage?.alt || item.product?.name || 'Product Image'}
                                      src={item.product.featuredImage.url}
                                    />
                                  )}
                                </div>
                                <Link
                                  href={productUrl}
                                  onClick={closeCart}
                                  className="z-30 ml-2 flex flex-row space-x-4"
                                >
                                  <div className="flex flex-1 flex-col text-base">
                                    <span className="leading-tight">
                                      {item.product?.name || 'Product not found'}
                                    </span>
                                    {/* Variant title display removed for simplicity */}
                                  </div>
                                </Link>
                              </div>
                              <div className="flex h-16 flex-col justify-between">
                                <Price
                                  className="flex justify-end space-y-2 text-right text-sm"
                                  amount={((item.product?.price || 0) * item.quantity).toFixed(2)}
                                  currencyCode={item.product?.priceRange?.minVariantPrice?.currencyCode || cart.currency_code || 'USD'}
                                />
                                <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                  <EditItemQuantityButton
                                    item={item} // item is SupabaseCartItem
                                    type="minus"
                                    optimisticUpdate={updateCartItem} // This function needs to be adapted
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    item={item} // item is SupabaseCartItem
                                    type="plus"
                                    optimisticUpdate={updateCartItem} // This function needs to be adapted
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      {/* Tax calculation would be custom or from Supabase if implemented */}
                      <p className="text-right text-base text-black dark:text-white">
                        Calculated at checkout
                      </p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Shipping</p>
                      <p className="text-right">Calculated at checkout</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Total</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={(cart.total_amount || 0).toFixed(2)}
                        currencyCode={cart.currency_code || 'USD'}
                      />
                    </div>
                  </div>
                  {/* Checkout form is Shopify specific, replaced with a new button */}
                  <ProceedToMockCheckoutButton />
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          'h-6 transition-all ease-in-out hover:scale-110',
          className
        )}
      />
    </div>
  );
}

function CheckoutButton() { // This was the original Shopify button, now unused.
  const { pending } = useFormStatus();

  return (
    <button
      className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
      type="submit"
      disabled={true} // Kept disabled as it's Shopify specific
    >
      {pending ? <LoadingDots className="bg-white" /> : 'Proceed to Checkout (Shopify)'}
    </button>
  );
}

// New component for Supabase conceptual checkout with Razorpay simulation
function ProceedToMockCheckoutButton() {
  const { cart } = useCart();
  const [isLoading, setIsLoading] = useState(false); // General loading state for the process
  const [clearCartMessage, dispatchClearCart] = useActionState(clearCartAction, null);

  const handlePayment = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (!cart.user_id) {
      alert('User not identified. Cannot create order.');
      return;
    }

    setIsLoading(true);

    // --- Step 1: Create Razorpay Order (Client -> Edge Function) ---
    // In a real app, the client calls an Edge Function (e.g., 'create-razorpay-order')
    // which then calls Razorpay's Orders API to create an order.
    // This Edge Function returns the Razorpay order_id to the client.
    console.log("CLIENT: Attempting to create Razorpay order via Edge Function...");
    alert("CLIENT: Simulating call to 'create-razorpay-order' Edge Function.\nThis function would take cart details, calculate amount, and hit Razorpay's Orders API.");
    const mockRazorpayOrderId = `mock_rzp_order_${Date.now()}`; // Simulate getting this from the Edge Function
    console.log(`CLIENT: Mock Razorpay Order ID received: ${mockRazorpayOrderId}`);

    // --- Step 2: Open Razorpay Checkout (Client-side SDK) ---
    // The client uses the Razorpay order_id to open the Razorpay SDK checkout modal.
    // This part involves loading Razorpay's SDK script and configuring it.
    // For simulation, we use window.confirm.
    console.log("CLIENT: Simulating Razorpay SDK opening for payment...");
    const paymentConfirmed = window.confirm(
      `RAZORPAY SDK SIMULATION:\n\n` +
      `Order ID: ${mockRazorpayOrderId}\n` +
      `Amount: ${(cart.total_amount || 0).toFixed(2)} ${cart.currency_code || 'INR'}\n\n` +
      `Click 'OK' to simulate a successful payment, or 'Cancel' for a failed payment.`
    );

    if (paymentConfirmed) {
      // If payment is successful, Razorpay SDK's handler function receives payment details.
      const mockPaymentResponse = {
        razorpay_payment_id: `mock_rzp_payment_${Date.now()}`,
        razorpay_order_id: mockRazorpayOrderId, // This should match the order_id from Razorpay
        razorpay_signature: `mock_rzp_signature_${Date.now()}` // Generated by Razorpay
      };
      console.log("RAZORPAY SDK SIMULATION: Payment successful.", mockPaymentResponse);
      alert(`RAZORPAY SDK SIMULATION: Payment Successful!\n\nPayment ID: ${mockPaymentResponse.razorpay_payment_id}`);

      // --- Step 3: Verify Payment and Create Order (Client -> Edge Function -> Edge Function) ---
      // The client now sends these payment details to another Edge Function (e.g., 'verify-razorpay-payment').
      console.log("CLIENT: Sending payment details to 'verify-razorpay-payment' Edge Function for verification...");
      alert("CLIENT: Simulating call to 'verify-razorpay-payment' Edge Function.\nThis function verifies Razorpay signature and, if valid, triggers internal order creation.");

      // The 'verify-razorpay-payment' Edge Function would:
      // 1. Verify the signature.
      // 2. If valid, then invoke the 'create-order' Edge Function (or contain its logic)
      //    to save the order to your Supabase database.

      // For this simulation, we'll directly call our client-side mock of `supabaseCreateOrder`
      // as if the 'verify-razorpay-payment' function confirmed everything and then called 'create-order'.
      const mockShippingAddress = { name: 'Mock User', street: '123 Mock St', city: 'Mockville', state: 'MS', postal_code: '00000', country: 'MCK' };
      try {
        console.log("SIMULATION: 'verify-razorpay-payment' was successful, now calling (mock) supabaseCreateOrder...");
        const order = await supabaseCreateOrder(
          cart.user_id,
          cart,
          mockShippingAddress,
          mockShippingAddress,
          // Pass relevant Razorpay details to be stored in payment_details
          JSON.stringify({
            method: "razorpay",
            razorpay_payment_id: mockPaymentResponse.razorpay_payment_id,
            razorpay_order_id: mockPaymentResponse.razorpay_order_id
            // Do NOT store razorpay_signature here; it's for verification only.
          })
        );

        if (order) {
          alert(`INTERNAL: Order ${order.id} (Supabase) created successfully after mock Razorpay payment verification!`);
          dispatchClearCart(null); // Clear the cart via server action
        } else {
          alert('INTERNAL: Failed to create Supabase order after mock payment verification.');
        }
      } catch (e) {
        console.error('Error creating Supabase order:', e);
        alert('An error occurred creating the Supabase order during simulation.');
      }
    } else {
      console.log("RAZORPAY SDK SIMULATION: Payment cancelled or failed by user.");
      alert('Mock Razorpay payment cancelled or failed.');
    }

    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isLoading || !cart || !cart.items || cart.items.length === 0}
        className="block w-full rounded-full bg-green-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 disabled:opacity-50"
      >
        {/* Renamed button */}
        {isLoading ? <LoadingDots className="bg-white" /> : 'Proceed to Payment (Simulated Razorpay)'}
      </button>
      {clearCartMessage && <p className="mt-2 text-sm text-red-600">{clearCartMessage}</p>}
    </>
  );
}
