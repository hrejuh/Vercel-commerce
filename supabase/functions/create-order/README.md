# Supabase Edge Function: `create-order`

## Purpose

This serverless function is responsible for securely creating a new order in the system. **Crucially, this function should be invoked *after* a payment has been successfully processed and verified by a separate, dedicated payment verification Edge Function (e.g., `verify-razorpay-payment`).** It handles the final database operations for order creation once payment is confirmed.

It handles critical backend logic that should not be run on the client-side.

## Trigger

Typically invoked internally by another Edge Function (e.g., `verify-razorpay-payment`) after successful payment verification, or directly if handling non-gateway payments (e.g., "Cash on Delivery" if admin confirms). It's generally not called directly by the client without prior payment verification.

Example client-side invocation:
```javascript
const { data, error } = await supabase.functions.invoke('create-order', {
  body: {
    userId,
    cartId, // ID of the user's cart (or cart items snapshot if cart is cleared earlier)
    shippingAddress,
    billingAddress,
    paymentDetails // Must include verified payment info (e.g., transaction_id, method, amount_captured, currency, razorpay_payment_id, razorpay_order_id, razorpay_signature if applicable)
  }
});
if (error) console.error("Error creating order:", error);
// Handle success or error
```

## Input Parameters (Request Body)

-   `userId` (string, required): The ID of the authenticated user placing the order. Should be validated against the authenticated user context.
-   `cartId` (string, optional but recommended): The ID of the user's cart. Alternatively, validated cart items can be passed directly if the cart is cleared immediately after payment verification by the calling function.
-   `cartItemsSnapshot` (array, optional): If `cartId` is not provided or if the cart is ephemeral, a snapshot of `SupabaseCartItem`-like objects (with `product_id`, `quantity`, `price_at_purchase_from_client_for_reference`). The function *must* re-fetch product prices for security.
-   `shippingAddress` (object, required): JSON object containing shipping address details.
    -   Example: `{ "name": "Jane Doe", "street": "123 Main St", "city": "Anytown", "state": "CA", "postal_code": "90210", "country": "US", "phone": "555-1234" }`
-   `billingAddress` (object, required): JSON object containing billing address details.
-   `paymentDetails` (object, required): JSON object containing **verified** information about the payment.
    -   Example for Razorpay: `{ "method": "razorpay", "razorpay_payment_id": "pay_xxxx", "razorpay_order_id": "order_xxxx", "razorpay_signature": "xxxx", "amount_captured": 10599, "currency": "INR" }`
    -   The `amount_captured` and `currency` here are from the payment gateway's confirmation.
-   `customerNotes` (string, optional): Any notes provided by the customer during checkout.

## Key Processing Steps

1.  **Authentication & Authorization**:
    -   Verify that the request comes from an authenticated user (using `context.auth`).
    -   Ensure the `userId` in the request body matches the authenticated user.

2.  **Input Validation**:
    -   Validate all required input parameters (e.g., `cartId`, addresses, `paymentDetails`).
    -   Validate the structure and content of address objects.

3.  **Fetch Cart Details**:
    -   Retrieve the cart and its items from the `carts` and `cart_items` tables using `cartId` and `userId` to ensure the cart belongs to the user.
    -   If cart is empty or not found, return an error.

4.  **Product Validation & Stock Check**:
    -   For each item in the cart:
        -   Fetch the current product details (especially price and stock) from the `products` table using `product_id`.
        -   **Crucial**: Check if there is sufficient stock for the quantity requested.
        -   If any item is out of stock or has insufficient stock, return an error (e.g., "Some items in your cart are no longer available or have insufficient stock."). This prevents overselling.

5.  **Calculate Final Totals**:
    -   Recalculate the total order amount based on current product prices fetched in step 4 and quantities from the cart. This is critical to prevent price tampering from the client-side.
    -   Apply any applicable taxes or discounts (if this logic resides in the backend). For now, assume taxes are included or handled separately.
    -   The server-calculated total should be the source of truth for the order amount. The `paymentDetails.amount_captured` should be reconciled against this. If there's a mismatch, it could indicate an issue or require manual review. For simplicity, we might assume they match if payment verification was successful.

6.  **Create Order Record**:
    -   Start a database transaction.
    -   Insert a new record into the `orders` table with:
        -   `user_id`
        -   Calculated `total_amount` and `currency_code` (from server-side calculation).
        -   `status` (e.g., 'processing' or 'confirmed' as payment is already verified).
        -   `shipping_address`, `billing_address`.
        -   `payment_details` (store relevant verified details, e.g., `razorpay_payment_id`, method).
        -   Any `customerNotes`.
    -   Get the newly created `order_id`.

7.  **Create Order Items**:
    -   For each item in the cart:
        -   Insert a new record into the `order_items` table with:
            -   `order_id` (from step 6)
            -   `product_id`
            -   `quantity`
            -   `price_at_purchase` (current price fetched in step 4)
            -   `currency_code_at_purchase`
            -   `product_snapshot` (key details like name, image URL, SKU for historical record).
        -   **Crucial**: Decrement stock for the `product_id` in the `products` table by the `quantity` ordered. Ensure this is an atomic operation (e.g., `UPDATE products SET stock = stock - ordered_quantity WHERE id = product_id AND stock >= ordered_quantity`). If the update fails (e.g. stock became insufficient due to a race condition), rollback transaction and return error.

8.  **Clear User's Cart**:
    -   Delete items from `cart_items` associated with the `cart_id`.
    -   Delete the cart from the `carts` table (or mark it as 'processed' or 'inactive').

9.  **Commit Transaction**: If all steps above are successful, commit the database transaction.

10. **Trigger Post-Order Actions (Asynchronous)**:
    -   Invoke another Edge Function (e.g., `send-order-confirmation-email`) to send an order confirmation email to the user. This should be done asynchronously to not delay the response to the client.
        ```javascript
        // No await here for asynchronous invocation
        supabase.functions.invoke('send-order-confirmation-email', { body: { orderId: newOrderId } })
        ```
    -   Potentially trigger notifications to admin/fulfillment systems.

## Expected Output

-   **Success**:
    -   HTTP Status: `200 OK`
    -   Body: `{ "success": true, "orderId": "new_order_uuid", "message": "Order created successfully." }`
-   **Error**:
    -   HTTP Status: `4xx` (e.g., `400 Bad Request`, `401 Unauthorized`, `409 Conflict` for stock issues) or `5xx` (server errors).
    -   Body: `{ "success": false, "error": "Error message describing the issue." }`

## Security Considerations

-   Always validate user authentication.
-   Perform all critical calculations (totals) and data modifications (stock, order creation) on the server-side.
-   Use database transactions to ensure atomicity of order creation and stock updates.
-   Sanitize all inputs.
-   Handle errors gracefully and provide meaningful (but not overly revealing) error messages to the client.
-   Ensure appropriate RLS (Row Level Security) policies are in place for all tables accessed by the function. The function itself typically runs with service_role privileges but should operate on behalf of the authenticated user where appropriate.
```
