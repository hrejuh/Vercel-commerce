// import cartFragment from '../fragments/cart';

// export const getCartQuery = /* GraphQL */ `
//   query getCart($cartId: ID!) {
//     cart(id: $cartId) {
//       ...cart
//     }
//   }
//   ${cartFragment}
// `;

// Cart related GraphQL queries are removed as we are migrating to Supabase.
// The corresponding data fetching will be handled by functions in lib/supabase/cart.ts
export {}; // Add an empty export to ensure the file is treated as a module.
