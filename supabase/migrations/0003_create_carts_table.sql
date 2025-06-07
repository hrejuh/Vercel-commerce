CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming user_id from auth schema
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
COMMENT ON TABLE public.carts IS 'Shopping carts';
