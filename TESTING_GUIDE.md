# Comprehensive Testing Guide for Supabase E-commerce Application

This guide provides steps to test the core functionalities of the e-commerce application after migrating to Supabase as the backend. Ensure all database migrations, RLS policies, and Supabase Edge Functions have been deployed and configured correctly before starting.

## Prerequisites

1.  **Supabase Backend Setup**:
    *   Database schema migrated (see `supabase/migrations/`).
    *   Row Level Security (RLS) policies applied (see `supabase/rls_policies/`).
    *   Edge Functions deployed (`create-order`, etc. - see `supabase/functions/`).
    *   Environment variables for Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are correctly set for both the Next.js application and the Edge Functions.
    *   Payment gateway (e.g., Razorpay) API keys set as secrets for Edge Functions.
2.  **Seed Data**:
    *   It's highly recommended to populate your database with initial data using the provided seed scripts in `supabase/seed_data/`. Run these via the Supabase SQL Editor or `psql` after migrations and RLS are set.
    *   The seed scripts use placeholder image URLs like `/images/placeholder_phone.png`. For these images to render, you'll need to:
        *   Create a `public/images/` directory in your Next.js project.
        *   Add placeholder images with the corresponding names (e.g., `placeholder_phone.png`, `placeholder_laptop.png`, etc.). You can find generic placeholder images online or create simple ones.
        *   Alternatively, update the seed scripts to point to valid image URLs from a CDN or other source.
3.  **Application Running**: The Next.js application should be running locally (`pnpm dev`) or on a deployment.

## I. User Authentication

### 1.1. User Sign-Up

*   **Actions (UI)**:
    1.  Navigate to the `/auth` page (or click "Sign In" then "Don't have an account? Sign Up").
    2.  Enter a new email address, a strong password, and confirm the password.
    3.  Click the "Sign Up" button.
*   **Expected Outcome (UI)**:
    *   A success message should appear (e.g., "Please check your email to confirm your sign up.").
    *   (If email confirmation is enabled in Supabase Auth settings) You should receive a confirmation email. Clicking the link should confirm your account.
*   **Verification (Supabase)**:
    *   **Database**: Check the `auth.users` table. A new user record should exist with the provided email. The `confirmed_at` field will be null until email confirmation.
    *   **Auth Settings**: In Supabase Dashboard > Authentication > Users, the new user should appear.

### 1.2. User Sign-In

*   **Actions (UI)**:
    1.  Ensure the user account from 1.1 is confirmed (if email confirmation is enabled).
    2.  Navigate to the `/auth` page.
    3.  Enter the email and password used for sign-up.
    4.  Click the "Sign In" button.
*   **Expected Outcome (UI)**:
    *   The user should be redirected to the homepage (`/`) or their intended page.
    *   The navigation bar should now display the user's email, a "My Orders" link, and a "Sign Out" button.
*   **Verification (Supabase/Client)**:
    *   **Developer Tools (Browser)**: Check for Supabase session cookies or local storage entries (e.g., `sb-access-token`, `sb-refresh-token`).

### 1.3. User Sign-Out

*   **Actions (UI)**:
    1.  While logged in, click the "Sign Out" button in the navigation bar.
*   **Expected Outcome (UI)**:
    *   The user should be signed out.
    *   The navigation bar should revert to showing the "Sign In" link.
    *   Accessing protected routes (like `/orders`) should redirect to `/auth` or show an appropriate message.
*   **Verification (Supabase/Client)**:
    *   **Developer Tools (Browser)**: Supabase session cookies/local storage should be cleared or invalidated.

### 1.4. Session Persistence

*   **Actions (UI)**:
    1.  Sign in successfully.
    2.  Close the browser tab/window.
    3.  Reopen the browser and navigate back to the application.
*   **Expected Outcome (UI)**:
    *   The user should still be logged in (session persists).
    *   The navigation bar should show user details and "Sign Out".
*   **Verification (Supabase/Client)**:
    *   As in 1.2.

## II. Product Display & Browsing

### 2.1. Homepage Products

*   **Actions (UI)**:
    1.  Navigate to the homepage (`/`).
*   **Expected Outcome (UI)**:
    *   The "Three Item Grid" and "Carousel" sections should display products fetched from the `products` table (via `getAllProducts()` in `lib/supabase/products.ts`).
    *   Images, names, and prices should be visible.
    *   Clicking a product should navigate to its detail page.
*   **Verification (Supabase)**:
    *   Ensure the products displayed match those in your `products` table, especially those intended for homepage features (if specific logic was added beyond just taking the first few).

### 2.2. Product Listing/Search Page

*   **Actions (UI)**:
    1.  Navigate to `/search` or a category page (e.g., `/search/electronics` if using seeded data).
    2.  If on `/search`, try using the search input (if search functionality beyond basic `getAllProducts` is implemented in `lib/supabase/products.ts`).
*   **Expected Outcome (UI)**:
    *   A grid of products should be displayed.
    *   For category pages, only products from that category should appear (e.g., "Super Smartphone X" under "Electronics").
    *   Images, names, and prices should be correct.
    *   Clicking a product navigates to its detail page.
*   **Verification (Supabase)**:
    *   **Database**: Queries made by `getAllProducts()` or `getProductsByCategoryHandle()` should fetch the correct items from the `products` table based on the context.

### 2.3. Product Detail Page

*   **Actions (UI)**:
    1.  Navigate to a product detail page (e.g., `/product/super-smartphone-x`).
*   **Expected Outcome (UI)**:
    *   Product name, description, price, and images (gallery) should be displayed correctly.
    *   The "Add to Cart" button should be visible.
    *   Related products (if any from the same category) should be displayed.
*   **Verification (Supabase)**:
    *   **Database**: `getProductByHandle()` should fetch the specific product. `getRelatedProducts()` should fetch other products from the same `category_id`.

## III. Shopping Cart Functionality

### 3.1. Add Item to Cart

*   **Actions (UI)**:
    1.  Navigate to a product detail page.
    2.  Click the "Add to Cart" button.
*   **Expected Outcome (UI)**:
    *   The cart modal should open (or the cart icon quantity should update).
    *   The selected product should appear as an item in the cart with quantity 1.
    *   A success message/toast might appear (if implemented).
*   **Verification (Supabase)**:
    *   **Database**:
        *   A new row in `public.carts` should be created for the user if one didn't exist (check `user_id`).
        *   A new row in `public.cart_items` linking to the cart and product, with `quantity: 1`.
        *   If the item was already in the cart, its `quantity` in `public.cart_items` should increment.

### 3.2. View Cart

*   **Actions (UI)**:
    1.  Click the cart icon in the navigation bar.
*   **Expected Outcome (UI)**:
    *   The cart modal should open.
    *   All items added to the cart should be listed with their correct names, images, quantities, and calculated prices.
    *   The cart subtotal and total should be displayed.
*   **Verification (Supabase)**:
    *   **Database**: Data displayed should match records in `public.carts` and `public.cart_items` for the user. Product details are joined from `public.products`.

### 3.3. Update Item Quantity in Cart

*   **Actions (UI)**:
    1.  In the cart modal, use the "+" or "-" buttons to change the quantity of an item.
*   **Expected Outcome (UI)**:
    *   The item's quantity and its total price should update.
    *   The cart's overall total quantity and total amount should update.
    *   If quantity is reduced to 0, the item should be removed from the cart.
*   **Verification (Supabase)**:
    *   **Database**: The `quantity` field for the specific row in `public.cart_items` should be updated. If quantity becomes 0, the row should be deleted.

### 3.4. Remove Item from Cart

*   **Actions (UI)**:
    1.  In the cart modal, click the "X" (remove) button for an item.
*   **Expected Outcome (UI)**:
    *   The item should be removed from the cart display.
    *   The cart's overall total quantity and total amount should update.
*   **Verification (Supabase)**:
    *   **Database**: The corresponding row in `public.cart_items` should be deleted.

### 3.5. Cart Persistence

*   **Actions (UI)**:
    1.  Add items to the cart.
    2.  Sign out.
    3.  Sign back in with the same user.
    4.  View the cart.
*   **Expected Outcome (UI)**:
    *   The items previously added to the cart should still be present. (This assumes carts are tied to `user_id` and not cleared on sign-out by current logic).
*   **Verification (Supabase)**:
    *   **Database**: The `public.carts` and `public.cart_items` records for that `user_id` should persist across sessions.

## IV. Order Placement (Checkout Simulation)

### 4.1. Initiate Checkout & Simulate Payment

*   **Actions (UI)**:
    1.  Ensure there are items in the cart.
    2.  Open the cart modal.
    3.  Click the "Proceed to Payment (Simulated Razorpay)" button.
    4.  Follow the `window.alert` and `window.confirm` prompts to simulate:
        *   Call to `create-razorpay-order` Edge Function.
        *   Successful Razorpay payment.
        *   Call to `verify-razorpay-payment` Edge Function.
*   **Expected Outcome (UI)**:
    *   An alert should confirm successful order creation with an Order ID.
    *   The cart should become empty, or the UI should reflect that the cart has been cleared (e.g., cart modal shows "Your cart is empty").
*   **Verification (Supabase)**:
    *   **Edge Function Logs (`create-order`)**: Check Supabase Dashboard > Edge Functions > `create-order` > Logs. You should see:
        *   Log messages indicating the function was invoked.
        *   User authentication details.
        *   Input parameters received (cartId, addresses, payment details).
        *   Log of the call to `public.create_new_order_transactional` database function.
        *   The returned `orderId`.
        *   Any errors encountered during the process.
    *   **Database**:
        *   A new row in `public.orders` for the user, with correct `total_amount`, `status` (e.g., 'pending_confirmation'), addresses, and payment details.
        *   New rows in `public.order_items` corresponding to the items that were in the cart, linked to the new `order_id`. Each item should have `price_at_purchase` and a `product_snapshot`.
        *   Rows in `public.cart_items` for the processed `cart_id` should be deleted. The `public.carts` record might also be deleted or marked inactive depending on the DB function's final logic. (Current DB function only clears items).

## V. Order History & Details

### 5.1. View Order History Page

*   **Actions (UI)**:
    1.  Ensure you are logged in and have placed at least one order (via step IV).
    2.  Click the "My Orders" link in the navigation bar (or navigate to `/orders`).
*   **Expected Outcome (UI)**:
    *   A list of orders placed by the user should be displayed.
    *   Each order summary should show Order ID, date, total amount, and status.
    *   Each order should have a "View Details" link.
*   **Verification (Supabase)**:
    *   **Database**: The page should display data corresponding to records in `public.orders` for the logged-in `user_id`.

### 5.2. View Order Detail Page

*   **Actions (UI)**:
    1.  From the "My Orders" page, click "View Details" for a specific order.
*   **Expected Outcome (UI)**:
    *   Detailed information for the selected order should be displayed, including:
        *   Order ID, status, date.
        *   List of items in the order with their snapshot details (name, image, quantity, price paid).
        *   Shipping and billing addresses.
        *   Order total.
*   **Verification (Supabase)**:
    *   **Database**: The page should display data from the specific `public.orders` record and its associated `public.order_items` (with product snapshots).

---

This guide provides a comprehensive checklist. Depending on the depth of testing, not all database checks might be necessary for every UI test, but they are crucial for verifying the backend logic. Remember to adapt placeholder data (especially images) for a better testing experience.
```
