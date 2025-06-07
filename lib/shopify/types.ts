export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

// export type Cart = Omit<ShopifyCart, 'lines'> & {
//   lines: CartItem[];
// };
// Commented out as SupabaseCart in lib/supabase/cart.ts will be used.

// export type CartProduct = {
//   id: string;
//   handle: string;
//   title: string;
//   featuredImage: Image;
// };
// Commented out, SupabaseCartItem.product will use SupabaseProduct type.

// export type CartItem = {
//   id: string | undefined; // Shopify cart line ID
//   quantity: number;
//   cost: {
//     totalAmount: Money;
//   };
//   merchandise: { // This is Shopify's structure for product variant in cart
//     id: string; // This is the variant ID in Shopify
//     title: string; // Variant title
//     selectedOptions: {
//       name: string;
//       value: string;
//     }[];
//     product: CartProduct; // Simplified product info
//   };
// };
// Commented out as SupabaseCartItem in lib/supabase/cart.ts will be used.

export type Collection = ShopifyCollection & {
  path: string;
};

// export type Collection = ShopifyCollection & {
//   path: string;
// };
// Commented out as SupabaseCollection in lib/supabase/products.ts will be used.
// Existing usages might need to be updated if they specifically relied on the `path` field being added here.

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<ShopifyProduct, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
};

// export type Product = Omit<ShopifyProduct, 'variants' | 'images'> & {
//   variants: ProductVariant[];
//   images: Image[];
// };
// Commented out as SupabaseProduct in lib/supabase/products.ts will be used.

// export type ProductOption = {
//   id:string;
//   name: string;
//   values: string[];
// };
// Commented out as product options will be handled by Supabase-specific structures if needed.

// export type ProductVariant = {
//   id: string;
//   title: string;
//   availableForSale: boolean;
//   selectedOptions: {
//     name: string;
//     value: string;
//   }[];
//   price: Money;
// };
// Commented out as product variants will be handled by Supabase-specific structures if needed.

export type SEO = {
  title: string;
  description: string;
};

// export type ShopifyCart = {
//   id: string | undefined;
//   checkoutUrl: string;
//   cost: {
//     subtotalAmount: Money;
//     totalAmount: Money;
//     totalTaxAmount: Money;
//   };
//   lines: Connection<CartItem>; // CartItem is commented out
//   totalQuantity: number;
// };
// Commented out as SupabaseCart in lib/supabase/cart.ts will be used.

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
};

// export type ShopifyCollection = {
//   handle: string;
//   title: string;
//   description: string;
//   seo: SEO;
//   updatedAt: string;
// };
// Commented out as SupabaseCollection in lib/supabase/products.ts will be used.

// export type ShopifyProduct = {
//   id: string;
//   handle: string;
//   availableForSale: boolean;
//   title: string;
//   description: string;
//   descriptionHtml: string;
//   options: ProductOption[];
//   priceRange: {
//     maxVariantPrice: Money;
//     minVariantPrice: Money;
//   };
//   variants: Connection<ProductVariant>;
//   featuredImage: Image;
//   images: Connection<Image>;
//   seo: SEO;
//   tags: string[];
//   updatedAt: string;
// };
// Commented out as SupabaseProduct in lib/supabase/products.ts will be used.

// export type ShopifyCartOperation = {
//   data: {
//     cart: ShopifyCart; // ShopifyCart is commented out
//   };
//   variables: {
//     cartId: string;
//   };
// };
// Commented out.

// export type ShopifyCreateCartOperation = {
//   data: { cartCreate: { cart: ShopifyCart } }; // ShopifyCart is commented out
// };
// Commented out.

// export type ShopifyAddToCartOperation = {
//   data: {
//     cartLinesAdd: {
//       cart: ShopifyCart; // ShopifyCart is commented out
//     };
//   };
//   variables: {
//     cartId: string;
//     lines: {
//       merchandiseId: string; // Corresponds to a Shopify Variant ID
//       quantity: number;
//     }[];
//   };
// };
// Commented out.

// export type ShopifyRemoveFromCartOperation = {
//   data: {
//     cartLinesRemove: {
//       cart: ShopifyCart; // ShopifyCart is commented out
//     };
//   };
//   variables: {
//     cartId: string;
//     lineIds: string[]; // These are Shopify cart line IDs
//   };
// };
// Commented out.

// export type ShopifyUpdateCartOperation = {
//   data: {
//     cartLinesUpdate: {
//       cart: ShopifyCart; // ShopifyCart is commented out
//     };
//   };
//   variables: {
//     cartId: string;
//     lines: {
//       id: string; // Shopify cart line ID
//       merchandiseId: string; // Shopify Variant ID
//       quantity: number;
//     }[];
//   };
// };
// Commented out.

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection; // This ShopifyCollection is now commented out
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection; // This ShopifyCollection is now commented out
  };
  variables: {
    handle: string;
  };
};
// ShopifyCollectionOperation might be an issue if ShopifyCollection is fully removed and Cart/other features still use it.
// For now, assuming other parts of the app (like collections listing if any) might still use getCollection.
// If getCollection is also removed, this type would be fully obsolete.

// export type ShopifyCollectionProductsOperation = {
//   data: {
//     collection: {
//       products: Connection<ShopifyProduct>; // ShopifyProduct is commented out
//     };
//   };
//   variables: {
//     handle: string;
//     reverse?: boolean;
//     sortKey?: string;
//   };
// };
// Commented out as getCollectionProducts is removed.

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>; // ShopifyCollection is commented out
  };
// This type is used by getCollections. If getCollections is kept for non-product related collection listings,
// then ShopifyCollection would need to be kept or this type adjusted.
// For now, assuming getCollections might still be used.
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct }; // ShopifyProduct is commented out
  variables: {
    handle: string;
  };
};
// Commented out as getProduct is removed.

// export type ShopifyProductRecommendationsOperation = {
//   data: {
//     productRecommendations: ShopifyProduct[]; // ShopifyProduct is commented out
//   };
//   variables: {
//     productId: string;
//   };
// };
// Commented out as getProductRecommendations is removed.

// export type ShopifyProductsOperation = {
//   data: {
//     products: Connection<ShopifyProduct>; // ShopifyProduct is commented out
//   };
//   variables: {
//     query?: string;
//     reverse?: boolean;
//     sortKey?: string;
//   };
// };
// Commented out as getProducts is removed.
};
