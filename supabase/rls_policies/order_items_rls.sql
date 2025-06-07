DROP POLICY IF EXISTS "Allow user to select items in their own orders" ON public.order_items;
CREATE POLICY "Allow user to select items in their own orders" ON public.order_items
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
