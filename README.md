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

## Getting Started

This project is a template for a Next.js e-commerce application conceptually migrated to use Supabase as its backend.

### 1. Setting up the Supabase Backend

Follow these steps to set up your Supabase project. This is necessary for both local development and production.

1.  **Create a Supabase Project**:
    *   Go to [supabase.com](https://supabase.com) and create a new project.
    *   Save your project's **URL**, **anon key**, and **service role key**. You will need these.
    *   The database password set during project creation is also important for direct database access (e.g., running migrations with `psql` locally or applying them manually in the Supabase SQL Editor).

2.  **Configure Environment Variables for Next.js**:
    *   Create a `.env.local` file in the root of this Next.js project.
    *   Add your Supabase credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        # The SUPABASE_SERVICE_ROLE_KEY is typically not needed by the Next.js app directly
        # but is crucial for Edge Functions and backend processes.
        # For local development where you might run scripts that need admin rights,
        // you can include it, but ensure it's not exposed to the client.
        # SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
        ```
    *   These variables are used by the Supabase client in the Next.js application.

3.  **Apply Database Schema Migrations**:
    *   The SQL migration files are located in the `supabase/migrations/` directory.
    *   These files define the database schema (tables, extensions, functions).
    *   Apply them in numerical order (e.g., `0000_...sql`, `0001_...sql`, up to `0007_...sql`).
    *   You can apply these using the Supabase SQL Editor in your project dashboard or via `psql` if you have direct database access configured.
    *   **Example using Supabase SQL Editor**: Copy the content of each migration file and run it.
    *   **Example using Supabase CLI (for local development linked to a remote Supabase instance or for production deployments if CI/CD is set up)**:
        ```bash
        # Ensure you are logged in and linked to your project
        supabase login
        supabase link --project-ref <your-project-ref>
        # Apply migrations (ensure your local migrations are up-to-date with this repo)
        supabase db push
        # Note: `supabase db push` applies migrations from your local `supabase/migrations` directory
        # that haven't been applied yet. If you've manually run them via SQL editor,
        # ensure your local Supabase CLI state is consistent or manage migrations carefully.
        ```

4.  **Apply Row Level Security (RLS) Policies**:
    *   The SQL files for RLS policies are in `supabase/rls_policies/`.
    *   These are critical for securing your data.
    *   Apply them in order, starting with `000_enable_rls.sql`, followed by the table-specific RLS files.
    *   Use the Supabase SQL Editor or `psql` to run these scripts after migrations are complete.

5.  **Configure Edge Function Environment Variables (Secrets)**:
    *   The `create-order` Edge Function (and potentially others like `verify-razorpay-payment`) requires environment variables/secrets.
    *   In your Supabase project dashboard, navigate to Edge Functions, select your function (e.g., `create-order`), and go to the "Secrets" or "Environment Variables" section.
    *   Set the following (as per `supabase/functions/create-order/index.ts` and general needs):
        *   `SUPABASE_URL`: Your project's URL (same as `NEXT_PUBLIC_SUPABASE_URL`).
        *   `SUPABASE_ANON_KEY`: Your project's anon key (same as `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
        *   `SUPABASE_SERVICE_ROLE_KEY`: Your project's service role key. This is often needed if Edge Functions perform privileged operations beyond what RLS allows for the calling user, or if they need to act as an admin for certain tasks (though SECURITY DEFINER functions can also achieve this).
        *   `RAZORPAY_KEY_ID` (Example, if using Razorpay): Your Razorpay Key ID.
        *   `RAZORPAY_KEY_SECRET` (Example, if using Razorpay): Your Razorpay Key Secret.
    *   Refer to `supabase/functions/README.md` for more details on specific function requirements.

6.  **Deploy Supabase Edge Functions**:
    *   The Edge Function code is located in `supabase/functions/`.
    *   Deploy them using the Supabase CLI:
        ```bash
        supabase functions deploy create-order --project-ref <your-project-ref>
        # Deploy other functions as needed, e.g., verify-razorpay-payment
        ```
    *   Ensure you are logged in (`supabase login`) and linked to the correct project (`supabase link --project-ref <your-project-ref>`).

7.  **(Optional but Recommended) Seed Data**:
    *   SQL scripts for seeding sample data (categories, products) are in `supabase/seed_data/`.
    *   Run these scripts using the Supabase SQL Editor or `psql` after migrations and RLS policies have been applied. This will populate your store with initial data for testing and development.
    *   Remember to add placeholder images to `public/images/` or update image URLs in the seed scripts.

### 2. Running the Next.js Application Locally

Once the Supabase backend is set up and your `.env.local` file is populated:

You will need to use the environment variables [defined in `.env.example`](.env.example) (especially for Supabase URL and Anon Key) to run Next.js Commerce. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this if deploying to Vercel, but a `.env.local` file is necessary for local development.

> Note: You should not commit your `.env.local` file if it contains sensitive keys like `SUPABASE_SERVICE_ROLE_KEY`. The `.gitignore` file is already configured to ignore `.env.local`.

<!-- The Vercel CLI steps below are more relevant for projects managed via Vercel teams and downloading Vercel-specific env vars.
     For Supabase setup, manual .env.local is the primary method described above for local dev.
1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull` (This pulls Vercel-managed env vars, ensure they match your Supabase setup if using this flow)
-->

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

<details>
  <summary>Expand if you work at Vercel and want to run locally and / or contribute (Original Shopify Instructions)</summary>

1. Run `vc link`.
1. Select the `Vercel Solutions` scope.
1. Connect to the existing `commerce-shopify` project.
1. Run `vc env pull` to get environment variables.
1. Run `pnpm dev` to ensure everything is working correctly.
</details>

<!-- The Shopify integration guide is less relevant now, keeping it for historical context or if parts are useful for general Vercel deployment understanding.
## Vercel, Next.js Commerce, and Shopify Integration Guide

You can use this comprehensive [integration guide](https://vercel.com/docs/integrations/ecommerce/shopify) with step-by-step instructions on how to configure Shopify as a headless CMS using Next.js Commerce as your headless Shopify storefront on Vercel.
-->

---

## Deployment

This section provides guidance on deploying the application, which has been conceptually migrated to use Supabase for its backend.

### Recommended Hosting

-   **Vercel**: Excellent integration with Next.js. Supports environment variables, custom domains, and automatic deployments from Git. The `vercel.json` file in this repository provides a basic configuration.
-   **Netlify**: Another popular platform for deploying Next.js applications with similar features to Vercel.
-   **Other Node.js Hosting**: Any platform that can run a Node.js application can host a Next.js app, though serverless-specific features of Next.js might require more configuration.

### Environment Variables for Production Deployment

When deploying your Next.js frontend to a hosting provider (like Vercel, Netlify, Cloudflare Pages), you will need to configure the following environment variables in the provider's settings:

-   `NEXT_PUBLIC_SUPABASE_URL`: The public URL for your Supabase project.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for your Supabase project.

**Important**: `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, etc., are backend/Edge Function secrets and should **NOT** be set in your frontend deployment environment variables. They are managed within Supabase (Edge Function settings > Secrets).

### Build Command for Production

The typical build command for this project is:
```bash
pnpm build
```
This command should be used by your hosting provider during the build step. The `vercel.json` file specifies this.

### Supabase Setup for Production (Recap)

This repeats some information from "Setting up the Supabase Backend" but is crucial for the production deployment checklist:

1.  **Database Schema & RLS**: Ensure all migrations (`supabase/migrations/`) and RLS policies (`supabase/rls_policies/`) are applied to your *production* Supabase instance.
2.  **Authentication**: Production Auth settings (providers, email templates, redirect URLs) are configured.
3.  **Edge Functions**: All required Edge Functions are deployed to Supabase (`supabase functions deploy <function_name>`).
4.  **Edge Function Secrets**: All necessary secrets (e.g., `SUPABASE_SERVICE_ROLE_KEY`, payment gateway keys) are set for the deployed Edge Functions in the Supabase dashboard.
5.  **Storage**: Production storage buckets and policies are in place.

### Vercel Specific Notes

-   The included `vercel.json` specifies `pnpm build`. Vercel should automatically detect Next.js.
-   The `outputDirectory: "out"` in `vercel.json` is typically for static exports (`next export`). For a standard dynamic Next.js deployment on Vercel, Vercel automatically uses the `.next` directory and this setting might not be needed or could even conflict if not a static export. If deploying a dynamic app, consider removing `outputDirectory` or ensuring your build process aligns. (Kept as per prompt for now).

### Deploying to Cloudflare Pages

Cloudflare Pages is another excellent platform for deploying Next.js applications.

-   **Build Command**: `pnpm build` (or `npx @cloudflare/next-on-pages -- npm run build` if you need specific Next.js features adapted by `@cloudflare/next-on-pages`). For standard Next.js App Router, `pnpm build` is often sufficient.
-   **Output Directory**: Cloudflare Pages typically auto-detects the correct output directory for Next.js projects (usually `.next/` or `.vercel/output/` if built with Vercel CLI compatibility, or a specific directory if using `@cloudflare/next-on-pages`). Refer to Cloudflare's documentation.
-   **Environment Variables**:
    *   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your Cloudflare Pages project settings (Settings > Environment Variables).
    *   Remember, backend secrets like `SUPABASE_SERVICE_ROLE_KEY` or payment gateway secrets are managed in Supabase Edge Function settings, not on Cloudflare Pages for the frontend.
-   **Node.js Version**: Ensure Cloudflare Pages is using a compatible Node.js version (e.g., 18.x or higher) in its build environment settings.
-   **Note on Edge Functions**: Supabase Edge Functions are deployed separately via the Supabase CLI directly to your Supabase project. Your Cloudflare Pages deployment will make HTTPS requests to these functions at their invocation URL.
-   **Documentation**: For detailed and up-to-date instructions, refer to the [official Cloudflare Pages documentation for Next.js](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/).
