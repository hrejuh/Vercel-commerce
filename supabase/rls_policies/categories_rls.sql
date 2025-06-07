-- Remove any existing policies first to avoid conflicts during re-application
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
-- Policies
CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT
    USING (true);
