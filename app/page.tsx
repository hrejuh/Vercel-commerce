import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';

export const metadata = {
  description:
    'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: {
    type: 'website'
  }
};

export default function HomePage() {
  // Data for this page is fetched by child Server Components (ThreeItemGrid, Carousel).
  // If underlying product data changes (e.g., new featured products),
  // revalidation would typically be triggered by:
  // 1. Time-based revalidation (e.g., revalidate: 3600 in page config).
  // 2. On-demand revalidation (revalidateTag('products') or revalidatePath('/'))
  //    after admin actions update products or featured categories.
  return (
    <>
      <ThreeItemGrid />
      <Carousel />
      <Footer />
    </>
  );
}
