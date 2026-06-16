// app/page.tsx (Server Component)
import HeaderSlider from "@/components/Landing/HeaderSlider";
import HomeProducts from "@/components/Landing/HomeProducts";
import Banner from "@/components/Landing/Banner";
import NewsLetter from "@/components/Landing/NewsLetter";
import FeaturedProduct from "@/components/Landing/FeaturedProduct";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/Products/ProductsSkeletons";

export default function Home() {
  return (
    <>
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />

        {/* Wrap with Suspense for streaming */}
        <Suspense fallback={<ProductGridSkeleton count={10} />}>
          <HomeProducts limit={10} />
        </Suspense>

        <FeaturedProduct />
        <Banner />
        <NewsLetter />
      </div>
    </>
  );
}
