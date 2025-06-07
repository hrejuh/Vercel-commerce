// import cartFragment from '../fragments/cart';

// export const addToCartMutation = /* GraphQL */ `
//   mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
//     cartLinesAdd(cartId: $cartId, lines: $lines) {
//       cart {
//         ...cart
//       }
//     }
//   }
//   ${cartFragment}
// `;

// export const createCartMutation = /* GraphQL */ `
//   mutation createCart($lineItems: [CartLineInput!]) {
//     cartCreate(input: { lines: $lineItems }) {
//       cart {
//         ...cart
//       }
//     }
//   }
//   ${cartFragment}
// `;

// export const editCartItemsMutation = /* GraphQL */ `
//   mutation editCartItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
//     cartLinesUpdate(cartId: $cartId, lines: $lines) {
//       cart {
//         ...cart
//       }
//     }
//   }
//   ${cartFragment}
// `;

// export const removeFromCartMutation = /* GraphQL */ `
//   mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
//     cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
//       cart {
//         ...cart
//       }
//     }
//   }
//   ${cartFragment}
// `;

// Cart related GraphQL mutations are removed as we are migrating to Supabase.
// The corresponding data fetching will be handled by functions in lib/supabase/cart.ts
export {}; // Add an empty export to ensure the file is treated as a module.
