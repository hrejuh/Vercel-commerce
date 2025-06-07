CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    handle TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.categories IS 'Product categories';
