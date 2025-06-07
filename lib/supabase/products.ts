// Placeholder for Supabase product types and functions
export type SupabaseProduct = {
  id: string; // uuid
  name: string;
  description: string;
  price: number;
  images: { url: string; alt?: string }[];
  stock: number;
  category: string; // This could be a handle for a SupabaseCollection
  created_at?: string;
  updated_at?: string;
  handle: string;
  featuredImage?: { url: string; alt?: string };
  seo?: { title?: string; description?: string };
  tags?: string[];
  availableForSale?: boolean;
  priceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants?: any[];
  options?: any[];
};

export type SupabaseCollection = {
  handle: string;
  title: string;
  description?: string;
  seo?: { title?: string; description?: string };
  updated_at?: string; // Timestamp of last update
};

// Mock function to simulate fetching a single product from Supabase
export async function getProductByHandle(handle: string): Promise<SupabaseProduct | null> {
  console.log(`Fetching product from Supabase with handle: ${handle}`);
  if (handle === "mock-product-handle") {
    return {
      id: "mock-uuid-123",
      name: "Mock Supabase Product",
      description: "This is a mock product fetched from a Supabase placeholder function.",
      price: 99.99,
      images: [{ url: "https://via.placeholder.com/500x500.png?text=Mock+Product+Image+1", alt: "Mock Image 1" },{ url: "https://via.placeholder.com/500x500.png?text=Mock+Product+Image+2", alt: "Mock Image 2" }],
      stock: 50,
      category: "mock-category", // Corresponds to a SupabaseCollection handle
      handle: "mock-product-handle",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      featuredImage: { url: "https://via.placeholder.com/500x500.png?text=Mock+Featured+Image", alt: "Mock Featured" },
      seo: { title: "Mock Supabase Product SEO Title", description: "Mock SEO description." },
      tags: ["mock", "supabase-product"],
      availableForSale: true,
      priceRange: {
        minVariantPrice: { amount: "99.99", currencyCode: "USD" },
        maxVariantPrice: { amount: "99.99", currencyCode: "USD" },
      }
    };
  }
  return null;
}

// Mock function to simulate fetching related products
export async function getRelatedProducts(productId: string): Promise<SupabaseProduct[]> {
  console.log(`Fetching related products for Supabase product ID: ${productId}`);
  return [
    {
      id: "mock-related-uuid-1",
      name: "Mock Related Product 1",
      description: "Description for related product 1",
      price: 49.99,
      images: [{ url: "https://via.placeholder.com/300x300.png?text=Related+Product+1", alt: "Related 1" }],
      stock: 10,
      category: "mock-category",
      handle: "related-product-1",
      featuredImage: { url: "https://via.placeholder.com/300x300.png?text=Related+Product+1", alt: "Related 1" },
      priceRange: {
        minVariantPrice: { amount: "49.99", currencyCode: "USD" },
        maxVariantPrice: { amount: "49.99", currencyCode: "USD" },
      }
    },
  ];
}

// Mock function to simulate fetching all products or products by category (collection)
export async function getAllProducts(params?: { collectionHandle?: string, sortKey?: string, reverse?: boolean, query?: string }): Promise<SupabaseProduct[]> {
  console.log("Fetching products from Supabase with params:", params);
  const allMockProducts: SupabaseProduct[] = [
    {
      id: "mock-uuid-123",
      name: "Mock Supabase Product 1",
      description: "This is a mock product.",
      price: 79.99,
      images: [{ url: "https://via.placeholder.com/400x400.png?text=Product+1", alt: "Product 1" }],
      stock: 30,
      category: "mock-category",
      handle: "mock-product-handle",
      featuredImage: { url: "https://via.placeholder.com/400x400.png?text=Product+1", alt: "Product 1" },
       priceRange: {
        minVariantPrice: { amount: "79.99", currencyCode: "USD" },
        maxVariantPrice: { amount: "79.99", currencyCode: "USD" },
      }
    },
    {
      id: "mock-uuid-456",
      name: "Mock Supabase Product 2",
      description: "This is another mock product.",
      price: 129.49,
      images: [{ url: "https://via.placeholder.com/400x400.png?text=Product+2", alt: "Product 2" }],
      stock: 20,
      category: "another-category",
      handle: "another-mock-product",
      featuredImage: { url: "https://via.placeholder.com/400x400.png?text=Product+2", alt: "Product 2" },
      priceRange: {
        minVariantPrice: { amount: "129.49", currencyCode: "USD" },
        maxVariantPrice: { amount: "129.49", currencyCode: "USD" },
      }
    },
     {
      id: "mock-uuid-789",
      name: "Mock Supabase Product 3 (Category specific)",
      description: "This product is specifically for 'mock-category'.",
      price: 89.99,
      images: [{ url: "https://via.placeholder.com/400x400.png?text=Product+3+Cat1", alt: "Product 3" }],
      stock: 15,
      category: "mock-category",
      handle: "mock-product-cat-specific",
      featuredImage: { url: "https://via.placeholder.com/400x400.png?text=Product+3+Cat1", alt: "Product 3" },
       priceRange: {
        minVariantPrice: { amount: "89.99", currencyCode: "USD" },
        maxVariantPrice: { amount: "89.99", currencyCode: "USD" },
      }
    }
  ];

  if (params?.collectionHandle) {
    return allMockProducts.filter(p => p.category === params.collectionHandle);
  }
  // Basic query filtering (name or description)
  if (params?.query) {
    const searchTerm = params.query.toLowerCase();
    return allMockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  // Sorting would be implemented here based on sortKey and reverse
  // For now, returning all if no specific filter matches
  return allMockProducts;
}

// Mock function to simulate fetching a collection
export async function getCollectionByHandle(handle: string): Promise<SupabaseCollection | null> {
  console.log(`Fetching collection from Supabase with handle: ${handle}`);
  if (handle === "mock-category") {
    return {
      handle: "mock-category",
      title: "Mock Category Title",
      description: "This is a mock collection description from Supabase.",
      seo: {
        title: "Mock Category SEO Title",
        description: "Mock category SEO description."
      },
      updated_at: new Date().toISOString()
    };
  }
    if (handle === "another-category") {
    return {
      handle: "another-category",
      title: "Another Mock Category",
      description: "Description for another mock collection.",
      seo: {
        title: "Another Mock Category SEO Title",
        description: "SEO description for another mock category."
      },
      updated_at: new Date().toISOString()
    };
  }
  return null;
}
