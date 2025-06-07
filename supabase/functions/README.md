# Supabase Edge Functions (Conceptual Overview)

This document outlines potential Supabase Edge Functions that could be part of this e-commerce application. Each function would handle specific backend logic, ensuring security and separation of concerns.

## Core Edge Functions

### Order Processing & Payment (Example: Razorpay)

1.  **`create-razorpay-order`**
    *   **Purpose**: Creates an order with the Razorpay API before the user proceeds to payment on the Razorpay SDK. This is necessary to get a Razorpay `order_id`.
    *   **Trigger**: Client-side request when the user initiates the payment process (e.g., clicks "Proceed to Payment").
    *   **Input**: `cartId` (or `amount`, `currency`, `receipt` if calculated on client - though amount calculation on server is safer). User ID is derived from Supabase Auth context.
    *   **Core Logic**:
        *   Validate user authentication.
        *   Fetch cart details for the user from the database.
        *   Calculate the final amount and currency based on the cart.
        *   Call Razorpay's Orders API (`POST /orders`) with the amount, currency, receipt ID, etc.
        *   Store the returned Razorpay `order_id` temporarily, perhaps in a short-lived table or return it directly to the client.
    *   **Output**: `{ "success": true, "razorpayOrderId": "rzp_order_xxx", "amount": calculatedAmount, "currency": "INR" }` or an error object.

2.  **`verify-razorpay-payment`**
    *   **Purpose**: Verifies the payment signature received from Razorpay SDK on the client-side after a payment attempt. If successful, it then triggers the actual order creation in our database.
    *   **Trigger**: Client-side request after the Razorpay SDK's payment handler callback provides payment details.
    *   **Input**: `{ razorpay_payment_id, razorpay_order_id, razorpay_signature, original_order_details (e.g., our cartId or details needed for create-order) }`. User ID from Auth context.
    *   **Core Logic**:
        *   Validate user authentication.
        *   Securely verify the `razorpay_signature` using Razorpay's utility function and your Razorpay secret key.
        *   If signature is valid:
            *   Invoke the `create-order` Edge Function (see below) with the necessary cart/user details and now verified payment information (including `razorpay_payment_id`, `razorpay_order_id`).
            *   Alternatively, this function could directly contain the logic of `create-order` if preferred, but separating them keeps `create-order` more generic if other payment methods are added.
        *   If signature is invalid, return an error.
    *   **Output**: `{ "success": true, "orderId": "our_db_order_uuid", "message": "Payment verified and order creation initiated." }` or an error object.

3.  **`create-order`**
    *   **Purpose**: Securely creates the order in the application's database *after* payment has been successfully processed and verified. It handles stock validation, final total calculations, database record creation, cart clearing, and triggers post-order actions.
    *   **Trigger**: Typically invoked by `verify-razorpay-payment` function or a similar payment verification function for other gateways. Can also be triggered for non-gateway payments if applicable (e.g. Cash on Delivery, admin-created orders).
    *   **Input**: `userId`, `cartId` (or `cartItemsSnapshot`), `shippingAddress`, `billingAddress`, **verified** `paymentDetails` (e.g., `{ "method": "razorpay", "razorpay_payment_id": "pay_xxx", ... }`).
    *   **Core Logic**:
        *   Validate user authentication and input.
        *   Fetch cart items.
        *   Validate product stock and current prices.
        *   Recalculate totals to prevent client-side tampering.
        *   Create records in `orders` and `order_items` tables within a transaction.
        *   Decrement product stock.
        *   Clear the user's cart.
        *   Asynchronously invoke `send-order-confirmation-email`.
    *   **Output**: Success with `orderId` or an error object.
    *   **Details**: See `create-order/README.md`. (This file should be updated to reflect it's called post-payment-verification).

### General Purpose & Post-Order

4.  **`send-order-confirmation-email`**
    *   **Purpose**: Sends an order confirmation email to the user after an order is successfully created and payment is confirmed.
    *   **Trigger**: Invoked by the `create-order` function (asynchronously) after successful database commit, or potentially by a database trigger on the `orders` table when status becomes 'processing' or 'confirmed'.
    *   **Input**: `orderId` or full order details.
    *   **Core Logic**:
        *   Fetch order details (customer email, order items, total amount) using `orderId`.
        *   Format an HTML email template with the order information.
        *   Use an email sending service (e.g., Supabase has integrations, or external services like SendGrid, Resend) to dispatch the email.
    *   **Output**: Success or error status (logged internally, may not need to return data to invoking function if async).

3.  **`handle-payment-webhook` (e.g., for Stripe, Razorpay, PayPal)**
    *   **Purpose**: Handles incoming webhooks from payment gateways to update order status based on payment events (e.g., payment success, failure, refund).
    *   **Trigger**: Webhook event from the payment gateway (e.g., Stripe's `checkout.session.completed`).
    *   **Input**: Webhook payload from the payment gateway (structure varies by provider). Contains event type and payment/order related data.
    *   **Core Logic**:
        *   **Verify Webhook Signature**: Crucial for security to ensure the webhook is genuinely from the payment provider.
        *   Parse the webhook payload to extract relevant information (e.g., payment status, transaction ID, order ID stored in metadata).
        *   Update the corresponding order's `status` in the `orders` table (e.g., to 'processing' or 'paid' if payment succeeded, or 'payment_failed').
        *   If payment succeeded and wasn't handled synchronously by `create-order`, this might also trigger stock updates or fulfillment processes if not already done.
        *   Log the event and any errors.
    *   **Output**: Typically a `200 OK` response to the payment gateway to acknowledge receipt. Error responses (`4xx`, `5xx`) if processing fails. (Note: `handle-payment-webhook` is more for server-to-server notifications like chargebacks, subscription updates, whereas `verify-razorpay-payment` is for the initial payment verification flow initiated by client).

## Potential Additional Edge Functions

5.  **`user-management`**
    *   **Purpose**: Handle custom user-related logic beyond Supabase Auth's built-in capabilities.
    *   **Examples**:
        *   `on-user-created`: Triggered when a new user signs up. Could create a corresponding public `profiles` table entry, or initialize user-specific settings.
        *   `update-user-profile`: Securely updates user profile data if there are complex validation rules or side effects (e.g., updating data in multiple places).
        *   `delete-user-data`: Handles GDPR or user-initiated account deletion, ensuring all related data (orders, carts under their user_id if policy dictates) is properly anonymized or removed.

6.  **`product-reviews`**
    *   **Purpose**: Manage product review submissions.
    *   **Examples**:
        *   `submit-review`: Validates and stores a new product review. Could perform checks like ensuring the user has purchased the product.
        *   `get-product-reviews`: Fetches reviews for a product, potentially with pagination and sorting.

7.  **`admin-operations`** (Potentially a set of functions for an admin panel)
    *   **Purpose**: Provide secure endpoints for administrative tasks.
    *   **Examples**:
        *   `update-order-status`: Allows an admin to manually update an order's status (e.g., to 'shipped', 'delivered').
        *   `manage-product-stock`: Allows admin to update stock levels for products.
        *   `get-all-users`: Lists users for admin review (with appropriate PII protection).
        *   `process-refund`: Initiates a refund process, updating order status and potentially calling payment gateway APIs (e.g., Razorpay Refunds API).

8.  **`webhook-subscriptions`**
    *   **Purpose**: Manage subscriptions to external webhooks or internal events if building a more event-driven system.

## General Considerations for Edge Functions

*   **Security**: Always validate inputs and user authentication/authorization.
*   **Error Handling**: Implement robust error handling and logging.
*   **Idempotency**: For critical operations like payment webhooks, design functions to be idempotent where possible.
*   **Environment Variables**: Store sensitive keys (API keys for email/payment services) as Supabase secrets.
*   **Testing**: Develop a strategy for testing Edge Functions locally and after deployment.
*   **Permissions**: Edge Functions typically run with `service_role` key privileges, allowing them to bypass RLS. Structure queries carefully to respect data ownership and security.

---

## Deployment

Supabase Edge Functions are typically deployed using the Supabase CLI.

1.  **Login to Supabase CLI**:
    ```bash
    supabase login
    ```

2.  **Link your project** (if not already done):
    ```bash
    supabase link --project-ref <your-project-id>
    ```

3.  **Deploy a specific function**:
    Each Edge Function resides in its own directory within `supabase/functions/`. To deploy a function, navigate to your Supabase project directory in the terminal and run:
    ```bash
    supabase functions deploy <function_name> --project-ref <your-project-ref>
    ```
    Replace `<your-project-ref>` with your actual Supabase project reference ID.
    For example, to deploy the `create-order` function:
    ```bash
    supabase functions deploy create-order --project-ref <your-project-ref>
    ```

4.  **Deploy all functions**:
    You can deploy all functions by omitting the function name (ensure you are linked or provide `--project-ref`):
    ```bash
    supabase functions deploy
    ```
    However, it's often better to deploy functions individually or via a script for more control.

5.  **Set Secrets**:
    If your Edge Functions require sensitive information like API keys (e.g., `RAZORPAY_KEY_SECRET`, email provider keys), these should be set as secrets using the Supabase CLI, not hardcoded.
    ```bash
    supabase secrets set RAZORPAY_KEY_SECRET=your_actual_razorpay_key_secret
    supabase secrets set EMAIL_API_KEY=your_actual_email_api_key
    ```
    These secrets are then available as environment variables within the Edge Functions.

6.  **Environment Variables for Functions**:
    Besides secrets, you might need to set non-sensitive environment variables for your functions (e.g., `NEXT_PUBLIC_SUPABASE_URL` if a function needs to know its own public URL, though often not needed). This can sometimes be done in the `config.toml` for the project or per function. Refer to Supabase documentation for current best practices.

7.  **Local Development and Testing**:
    The Supabase CLI allows you to serve and test your functions locally before deploying:
    ```bash
    supabase functions serve <function_name> --no-verify-jwt # (add --no-verify-jwt for easier testing if not passing valid JWTs)
    ```

Refer to the official [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions) for the most up-to-date and detailed deployment instructions.
```
