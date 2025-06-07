DROP POLICY IF EXISTS "Allow user to select their own cart" ON public.carts;
DROP POLICY IF EXISTS "Allow user to insert their own cart" ON public.carts;
DROP POLICY IF EXISTS "Allow user to update their own cart" ON public.carts;
DROP POLICY IF EXISTS "Allow user to delete their own cart" ON public.carts;

CREATE POLICY "Allow user to select their own cart" ON public.carts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow user to insert their own cart" ON public.carts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to update their own cart" ON public.carts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to delete their own cart" ON public.carts
    FOR DELETE
    USING (auth.uid() = user_id);
