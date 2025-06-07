DROP POLICY IF EXISTS "Allow user to select items in their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Allow user to insert items into their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Allow user to update items in their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Allow user to delete items from their own cart" ON public.cart_items;

CREATE POLICY "Allow user to select items in their own cart" ON public.cart_items
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

CREATE POLICY "Allow user to insert items into their own cart" ON public.cart_items
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

CREATE POLICY "Allow user to update items in their own cart" ON public.cart_items
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

CREATE POLICY "Allow user to delete items from their own cart" ON public.cart_items
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
