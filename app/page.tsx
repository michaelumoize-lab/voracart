import HeaderSlider from "@/components/Landing/HeaderSlider";
import HomeProducts from "@/components/Landing/HomeProducts";
import Banner from "@/components/Landing/Banner";
import NewsLetter from "@/components/Landing/NewsLetter";
import FeaturedProduct from "@/components/Landing/FeaturedProduct";
import Navbar from "@/components/Landing/Navbar/Navbar";
import Footer from "@/components/Landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts />
        <FeaturedProduct />
        <Banner />
        <NewsLetter />
      </div>
      <Footer />
    </>
  );
}
