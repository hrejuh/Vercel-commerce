-- supabase/migrations/0007_create_new_order_transactional_function.sql
CREATE OR REPLACE FUNCTION public.create_new_order_transactional(
    p_user_id UUID,
    p_cart_id UUID,
    p_shipping_address JSONB DEFAULT NULL,
    p_billing_address JSONB DEFAULT NULL,
    p_payment_details JSONB DEFAULT NULL
)
RETURNS UUID -- Returns the new order_id
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Executes with the permissions of the function owner (usually postgres or supabase_admin)
-- SET search_path = public; -- Uncomment if you have complex search paths
AS $$
DECLARE
    v_order_id UUID;
    v_total_amount NUMERIC := 0;
    v_currency_code TEXT := 'USD'; -- Assuming a default or determine from products
    cart_item_record RECORD; -- Renamed from cart_item to avoid conflict with table name
    product_info RECORD;
BEGIN
    -- Calculate total amount and determine currency from cart items
    -- This is a simplified calculation; you might have more complex logic
    FOR cart_item_record IN
        SELECT ci.quantity, p.price, p.currency_code, p.id as product_id, p.name as product_name, p.images as product_images, p.description as product_description
        FROM public.cart_items ci
        JOIN public.products p ON ci.product_id = p.id
        WHERE ci.cart_id = p_cart_id
    LOOP
        v_total_amount := v_total_amount + (cart_item_record.quantity * cart_item_record.price);
        -- Potentially check if all items have the same currency or handle conversion
        -- For simplicity, using the currency of the last item, or a default if cart is empty (though checked later)
        v_currency_code := cart_item_record.currency_code;
    END LOOP;

    IF v_total_amount <= 0 THEN
        RAISE EXCEPTION 'Cart total amount must be positive. Cart ID: %', p_cart_id;
    END IF;

    -- Insert into orders table
    INSERT INTO public.orders (user_id, total_amount, currency_code, status, shipping_address, billing_address, payment_details)
    VALUES (p_user_id, v_total_amount, v_currency_code, 'pending_confirmation', p_shipping_address, p_billing_address, p_payment_details) -- Changed status
    RETURNING id INTO v_order_id;

    -- Insert into order_items table and create product snapshots
    FOR cart_item_record IN
        SELECT ci.quantity, p.price, p.currency_code, p.id as product_id, p.name as product_name, p.description as product_description, p.images as product_images, p.handle as product_handle
        FROM public.cart_items ci
        JOIN public.products p ON ci.product_id = p.id
        WHERE ci.cart_id = p_cart_id
    LOOP
        INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase, currency_code_at_purchase, product_snapshot)
        VALUES (
            v_order_id,
            cart_item_record.product_id,
            cart_item_record.quantity,
            cart_item_record.price,          -- Price at the time of purchase
            cart_item_record.currency_code,  -- Currency at the time of purchase
            jsonb_build_object(        -- Product snapshot
                'name', cart_item_record.product_name,
                'description', cart_item_record.product_description,
                'images', cart_item_record.product_images,
                'price', cart_item_record.price,
                'handle', cart_item_record.product_handle -- Added handle to snapshot
            )
        );
    END LOOP;

    -- Clear the cart items
    DELETE FROM public.cart_items WHERE cart_id = p_cart_id;
    -- Optionally, you could delete the cart itself if it's single-use per order
    -- For now, keeping the cart shell can be useful for record or if user wants to "reorder"
    -- DELETE FROM public.carts WHERE id = p_cart_id AND user_id = p_user_id;

    RETURN v_order_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details if possible, or raise a more generic error
        RAISE WARNING 'Error in create_new_order_transactional: SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
        RAISE EXCEPTION 'Failed to create order due to an internal error. SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.create_new_order_transactional(UUID, UUID, JSONB, JSONB, JSONB)
IS 'Creates a new order, order items from a cart, calculates total, and clears the cart within a single transaction. Should be called by a trusted Edge Function after payment verification.';
