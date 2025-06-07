-- Sample Products (assuming categories 'electronics', 'books', 'clothing' exist)
-- Get category IDs first to ensure FK constraints are met
DO $$
DECLARE
    electronics_cat_id UUID;
    books_cat_id UUID;
    clothing_cat_id UUID;
BEGIN
    SELECT id INTO electronics_cat_id FROM public.categories WHERE handle = 'electronics';
    SELECT id INTO books_cat_id FROM public.categories WHERE handle = 'books';
    SELECT id INTO clothing_cat_id FROM public.categories WHERE handle = 'clothing';

    INSERT INTO public.products (name, description, price, currency_code, images, stock, category_id, handle) VALUES
    ('Super Smartphone X', 'Latest model with AI camera', 799.99, 'USD', '[{"url":"/images/placeholder_phone.png", "alt": "Smartphone X"}]', 50, electronics_cat_id, 'super-smartphone-x'),
    ('Quantum Laptop Pro', 'Ultra-thin, powerful, long battery life', 1299.00, 'USD', '[{"url":"/images/placeholder_laptop.png", "alt": "Laptop Pro"}]', 30, electronics_cat_id, 'quantum-laptop-pro'),
    ('The Cosmic Adventure', 'A thrilling sci-fi novel', 19.95, 'USD', '[{"url":"/images/placeholder_book1.png", "alt": "Cosmic Adventure Book"}]', 100, books_cat_id, 'cosmic-adventure'),
    ('History of Time Travel', 'Non-fiction exploration of temporal paradoxes', 24.50, 'USD', '[{"url":"/images/placeholder_book2.png", "alt": "Time Travel Book"}]', 75, books_cat_id, 'history-of-time-travel'),
    ('Comfort Cotton T-Shirt', 'Soft and breathable, various colors', 25.00, 'USD', '[{"url":"/images/placeholder_tshirt.png", "alt": "Cotton T-Shirt"}]', 200, clothing_cat_id, 'comfort-cotton-tshirt'),
    ('Stylish Denim Jeans', 'Modern fit, durable denim', 60.00, 'USD', '[{"url":"/images/placeholder_jeans.png", "alt": "Denim Jeans"}]', 150, clothing_cat_id, 'stylish-denim-jeans')
    ON CONFLICT (handle) DO NOTHING;
END $$;
