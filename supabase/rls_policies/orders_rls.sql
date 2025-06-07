DROP POLICY IF EXISTS "Allow user to select their own orders" ON public.orders;
-- For orders, we generally don't allow direct client-side insert/update/delete by users.
-- These operations should be handled by trusted Supabase Edge Functions using service_role or a specific admin role.
CREATE POLICY "Allow user to select their own orders" ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);
