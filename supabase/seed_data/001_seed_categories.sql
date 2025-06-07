-- Sample Categories
INSERT INTO public.categories (name, description, handle) VALUES
('Electronics', 'Gadgets and devices', 'electronics'),
('Books', 'Novels, comics, and more', 'books'),
('Clothing', 'Apparel for all occasions', 'clothing')
ON CONFLICT (handle) DO NOTHING;
-- Add more if desired
