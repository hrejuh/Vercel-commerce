import { supabase } from './client'; // Import the Supabase client

// Define Supabase Product and Collection Types
// These types should align with your database schema.
// The 'category' field in SupabaseProduct might be 'category_id' if it's a foreign key.
// For joined data (like category name with product), you might need specific query types.

export type SupabaseImage = {
  url: string;
  alt?: string;
  // Potentially other fields like 'order' if you need to sort images
};

export type SupabaseProduct = {
  id: string; // uuid
  name: string;
  description: string | null;
  price: number;
  currency_code: string; // Added from schema
  images: SupabaseImage[] | null; // JSONB, can be array of objects
  stock: number | null;
  category_id: string | null; // Foreign key to categories table
  handle: string;
  created_at: string;
  updated_at: string | null;
  // Optional: if you join category data directly with product
  categories?: { name: string; handle?: string };
  // Fields that were for Shopify compatibility, adjust or remove as needed:
  // featuredImage?: SupabaseImage;
  // seo?: { title?: string; description?: string };
  // tags?: string[];
  // availableForSale?: boolean;
  // priceRange?: {
  //   minVariantPrice: { amount: string; currencyCode: string };
  //   maxVariantPrice: { amount: string; currencyCode: string };
  // };
};

export type SupabaseCollection = {
  id: string; // uuid
  name: string;
  description: string | null;
  handle: string;
  created_at: string;
  // seo?: { title?: string; description?: string }; // If you add an SEO JSONB field
};


// --- Real Supabase Product Functions ---

export async function getAllProducts(params?: {
  query?: string,
  sortKey?: string, // e.g., 'name', 'price', 'created_at'
  reverse?: boolean
}): Promise<SupabaseProduct[]> {
  let queryBuilder = supabase.from('products').select(`
    *,
    categories (id, name, handle)
  `);

  if (params?.query) {
    // Basic search on name and description. Adjust as needed.
    queryBuilder = queryBuilder.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
  }

  if (params?.sortKey) {
    queryBuilder = queryBuilder.order(params.sortKey, { ascending: !params?.reverse });
  } else {
    queryBuilder = queryBuilder.order('created_at', { ascending: false }); // Default sort
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
  return data || [];
}

export async function getProductByHandle(handle: string): Promise<SupabaseProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, handle)
    `)
    .eq('handle', handle)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST error code for "Not a single row" (i.e. not found)
      console.log(`Product with handle "${handle}" not found.`);
      return null;
    }
    console.error(`Error fetching product by handle "${handle}":`, error);
    throw error;
  }
  return data;
}

export async function getProductsByHandles(handles: string[]): Promise<SupabaseProduct[]> {
  if (!handles || handles.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, handle)
    `)
    .in('handle', handles);

  if (error) {
    console.error('Error fetching products by handles:', error);
    throw error;
  }
  return data || [];
}

export async function getProductsByCategoryHandle(categoryHandle: string): Promise<SupabaseProduct[]> {
  // First, get the category ID from its handle
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('handle', categoryHandle)
    .single();

  if (categoryError || !categoryData) {
    if (categoryError && categoryError.code !== 'PGRST116') { // Don't throw if just not found
        console.error(`Error fetching category by handle "${categoryHandle}":`, categoryError);
        throw categoryError;
    }
    console.log(`Category with handle "${categoryHandle}" not found.`);
    return []; // Return empty if category not found
  }

  const categoryId = categoryData.id;

  // Then, fetch products with that category_id
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, handle)
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });


  if (productsError) {
    console.error(`Error fetching products for category handle "${categoryHandle}":`, productsError);
    throw productsError;
  }
  return productsData || [];
}


export async function getCollectionByHandle(handle: string): Promise<SupabaseCollection | null> {
  const { data, error } = await supabase
    .from('categories') // Assuming 'categories' table serves as collections
    .select('*')
    .eq('handle', handle)
    .single();

  if (error) {
     if (error.code === 'PGRST116') {
      console.log(`Collection (category) with handle "${handle}" not found.`);
      return null;
    }
    console.error(`Error fetching collection by handle "${handle}":`, error);
    throw error;
  }
  return data;
}


export async function getRelatedProducts(productId: string, categoryId?: string, limit: number = 5): Promise<SupabaseProduct[]> {
  let categoryToQuery = categoryId;

  // If categoryId is not provided, fetch the current product to get its category_id
  if (!categoryToQuery && productId) {
    const { data: currentProduct, error: productError } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', productId)
      .single();

    if (productError || !currentProduct?.category_id) {
      console.error('Error fetching current product or product has no category for related products:', productError);
      return [];
    }
    categoryToQuery = currentProduct.category_id;
  }

  if (!categoryToQuery) {
    console.log('No category ID available to fetch related products.');
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, handle)
    `)
    .eq('category_id', categoryToQuery)
    .neq('id', productId) // Exclude the current product itself
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    throw error;
  }
  return data || [];
}

// Note: The 'availableForSale', 'featuredImage', 'seo', 'tags', 'priceRange', 'variants', 'options'
// fields previously in SupabaseProduct type were more for Shopify compatibility.
// They should be derived or handled based on your actual Supabase schema and needs.
// For example, `availableForSale` could be `stock > 0`.
// `featuredImage` could be `images ? images[0] : null`.
// SEO might be separate fields or a JSONB column.
// Variants and options would require additional tables and more complex logic.
// The `categories` field is now populated by a join in the queries.
// The `currency_code` is added as per the schema.
// `description`, `stock`, `images`, `category_id` are made nullable to match schema.
// `updated_at` is also made nullable.
// `SupabaseImage` type added for clarity.
// `getProductsByCategoryHandle` is added as a more direct replacement for Shopify's `getCollectionProducts`.
// `getAllProducts` now includes basic search and sort capabilities.`lib/supabase/products.ts` has been refactored:
-   All mock data and functions have been removed.
-   The `SupabaseProduct` and `SupabaseCollection` types have been updated to better align with the SQL schema (e.g., `category` became `category_id`, added `currency_code` to `SupabaseProduct`).
-   Real Supabase client calls are now used for:
    -   `getAllProducts(params)`: Fetches all products, with optional text search and sorting. Includes joined category data.
    -   `getProductByHandle(handle)`: Fetches a single product by its handle, including joined category data. Handles "not found" case.
    -   `getProductsByHandles(handles)`: Fetches multiple products by an array of handles.
    -   `getProductsByCategoryHandle(categoryHandle)`: Fetches products for a given category handle by first finding the category ID.
    -   `getCollectionByHandle(handle)`: Fetches a category by its handle (collections are categories).
    -   `getRelatedProducts(productId, categoryId, limit)`: Fetches related products, typically from the same category.
-   Basic error handling (logging and re-throwing) is included in each function.
-   A note at the end clarifies changes to `SupabaseProduct` type and how previous Shopify-compatibility fields might be handled with the new schema.

Next, **Step 3: Refactor `lib/supabase/cart.ts`**.
I'll remove mocks and implement real Supabase calls. I'll need to read its current content first.
