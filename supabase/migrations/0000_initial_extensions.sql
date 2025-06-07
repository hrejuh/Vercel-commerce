-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- Add any other extensions if needed, e.g., for vector embeddings if products had them
-- CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
