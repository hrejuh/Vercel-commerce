[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fcommerce&project-name=commerce&repo-name=commerce&demo-title=Next.js%20Commerce&demo-url=https%3A%2F%2Fdemo.vercel.store&demo-image=https%3A%2F%2Fbigcommerce-demo-asset-ksvtgfvnd.vercel.app%2Fbigcommerce.png&env=COMPANY_NAME,SHOPIFY_REVALIDATION_SECRET,SHOPIFY_STORE_DOMAIN,SHOPIFY_STOREFRONT_ACCESS_TOKEN,SITE_NAME)

# Next.js Commerce

A high-performance, server-rendered Next.js App Router ecommerce application.

This template uses React Server Components, Server Actions, `Suspense`, `useOptimistic`, and more.

<h3 id="v1-note"></h3>

> Note: Looking for Next.js Commerce v1? View the [code](https://github.com/vercel/commerce/tree/v1), [demo](https://commerce-v1.vercel.store), and [release notes](https://github.com/vercel/commerce/releases/tag/v1).

## Providers

Vercel will only be actively maintaining a Shopify version [as outlined in our vision and strategy for Next.js Commerce](https://github.com/vercel/commerce/pull/966).

Vercel is happy to partner and work with any commerce provider to help them get a similar template up and running and listed below. Alternative providers should be able to fork this repository and swap out the `lib/shopify` file with their own implementation while leaving the rest of the template mostly unchanged.

- Shopify (this repository)
- [BigCommerce](https://github.com/bigcommerce/nextjs-commerce) ([Demo](https://next-commerce-v2.vercel.app/))
- [Ecwid by Lightspeed](https://github.com/Ecwid/ecwid-nextjs-commerce/) ([Demo](https://ecwid-nextjs-commerce.vercel.app/))
- [Geins](https://github.com/geins-io/vercel-nextjs-commerce) ([Demo](https://geins-nextjs-commerce-starter.vercel.app/))
- [Medusa](https://github.com/medusajs/vercel-commerce) ([Demo](https://medusa-nextjs-commerce.vercel.app/))
- [Prodigy Commerce](https://github.com/prodigycommerce/nextjs-commerce) ([Demo](https://prodigy-nextjs-commerce.vercel.app/))
- [Saleor](https://github.com/saleor/nextjs-commerce) ([Demo](https://saleor-commerce.vercel.app/))
- [Shopware](https://github.com/shopwareLabs/vercel-commerce) ([Demo](https://shopware-vercel-commerce-react.vercel.app/))
- [Swell](https://github.com/swellstores/verswell-commerce) ([Demo](https://verswell-commerce.vercel.app/))
- [Umbraco](https://github.com/umbraco/Umbraco.VercelCommerce.Demo) ([Demo](https://vercel-commerce-demo.umbraco.com/))
- [Wix](https://github.com/wix/headless-templates/tree/main/nextjs/commerce) ([Demo](https://wix-nextjs-commerce.vercel.app/))
- [Fourthwall](https://github.com/FourthwallHQ/vercel-commerce) ([Demo](https://vercel-storefront.fourthwall.app/))

> Note: Providers, if you are looking to use similar products for your demo, you can [download these assets](https://drive.google.com/file/d/1q_bKerjrwZgHwCw0ovfUMW6He9VtepO_/view?usp=sharing).

## Integrations

Integrations enable upgraded or additional functionality for Next.js Commerce

- [Orama](https://github.com/oramasearch/nextjs-commerce) ([Demo](https://vercel-commerce.oramasearch.com/))

  - Upgrades search to include typeahead with dynamic re-rendering, vector-based similarity search, and JS-based configuration.
  - Search runs entirely in the browser for smaller catalogs or on a CDN for larger.

- [React Bricks](https://github.com/ReactBricks/nextjs-commerce-rb) ([Demo](https://nextjs-commerce.reactbricks.com/))
  - Edit pages, product details, and footer content visually using [React Bricks](https://www.reactbricks.com) visual headless CMS.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js Commerce. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control your Shopify store.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

<details>
  <summary>Expand if you work at Vercel and want to run locally and / or contribute</summary>

1. Run `vc link`.
1. Select the `Vercel Solutions` scope.
1. Connect to the existing `commerce-shopify` project.
1. Run `vc env pull` to get environment variables.
1. Run `pnpm dev` to ensure everything is working correctly.
</details>

## Vercel, Next.js Commerce, and Shopify Integration Guide

You can use this comprehensive [integration guide](https://vercel.com/docs/integrations/ecommerce/shopify) with step-by-step instructions on how to configure Shopify as a headless CMS using Next.js Commerce as your headless Shopify storefront on Vercel.

---

## Deployment

This section provides guidance on deploying the application, which has been conceptually migrated to use Supabase for its backend.

### Recommended Hosting

-   **Vercel**: Excellent integration with Next.js. Supports environment variables, custom domains, and automatic deployments from Git. The `vercel.json` file in this repository provides a basic configuration.
-   **Netlify**: Another popular platform for deploying Next.js applications with similar features to Vercel.
-   **Other Node.js Hosting**: Any platform that can run a Node.js application can host a Next.js app, though serverless-specific features of Next.js might require more configuration.

### Environment Variables

The following environment variables are essential for a production deployment connected to Supabase:

-   `NEXT_PUBLIC_SUPABASE_URL`: The public URL for your Supabase project.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for your Supabase project.
-   `SUPABASE_SERVICE_ROLE_KEY`: The secret service role key for your Supabase project. This is required for administrative tasks or operations that need to bypass RLS, typically within Supabase Edge Functions or secure server-side processes. **Never expose this key on the client-side.**
-   `RAZORPAY_KEY_ID` (Example): Your Razorpay Key ID, to be used by Supabase Edge Functions for payment processing.
-   `RAZORPAY_KEY_SECRET` (Example): Your Razorpay Key Secret, used for server-side verification in Supabase Edge Functions.
-   `JWT_SECRET` (or similar, if custom): If your Supabase project uses a custom JWT secret for Supabase Auth, ensure this is configured in your deployment environment for Edge Functions that verify JWTs. (Supabase handles JWTs by default, this is for custom setups).

### Build Command

The typical build command for this project is:
```bash
pnpm build
```
This command should be used by your hosting provider during the build step. The `vercel.json` file specifies this.

### Supabase Setup for Production

Before deploying the frontend, ensure your Supabase project is properly configured for production:

1.  **Database Schema**: Apply all necessary database migrations to your production Supabase database to create tables for `users` (from Auth), `products`, `carts`, `cart_items`, `orders`, `order_items`, etc.
2.  **Row Level Security (RLS)**: Implement and enable RLS policies on all tables to control data access. This is crucial for security.
    -   Users should only be able to access their own carts, orders, etc.
    -   Public data like products should be readable by everyone.
    -   Edge Functions might operate with `service_role` privileges but should be written to respect user permissions where appropriate.
3.  **Authentication**: Configure Supabase Auth settings, including providers (email/password, social logins), and email templates.
4.  **Edge Functions**:
    -   Deploy all necessary Supabase Edge Functions (e.g., `create-order`, `verify-razorpay-payment`, `send-order-confirmation-email`) using the Supabase CLI.
    -   Set any required secrets for these functions (e.g., `RAZORPAY_KEY_SECRET`, email provider API keys) using `supabase secrets set`.
5.  **Storage**: Configure Supabase Storage for product images or other assets if not using an external CDN. Ensure appropriate access policies are set up.

### Vercel Specific Notes

-   The included `vercel.json` specifies `pnpm build`. Vercel should automatically detect Next.js.
-   The `outputDirectory: "out"` in `vercel.json` is typically for static exports (`next export`). For a standard dynamic Next.js deployment on Vercel, Vercel automatically uses the `.next` directory and this setting might not be needed or could even conflict if not a static export. If deploying a dynamic app, consider removing `outputDirectory` or ensuring your build process aligns. (Kept as per prompt for now).
