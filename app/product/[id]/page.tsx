"use client";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Landing/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { Product } from "@/types";
import toast from "react-hot-toast";
import { ProductDetailSkeleton } from "@/components/Skeletons";
import ImageLightbox from "@/components/ImageLightbox";

const ProductPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const { products, router, addToCart, updateCartQuantity, cartItems } =
    useAppContext();

  const [productData, setProductData] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const quantity = productData ? cartItems[productData._id] || 0 : 0;

  useEffect(() => {
    const product = products.find((p) => p._id === id);
    if (product) setProductData(product);
  }, [id, products.length]);

  const handleAddToCart = async () => {
    if (!productData) return;
    await addToCart(productData._id);
    toast.success(`${productData.name} added to cart!`, {
      icon: "🛒",
      style: { borderRadius: "8px", background: "#333", color: "#fff" },
    });
  };

  const handleDecrease = async () => {
    if (!productData) return;
    await updateCartQuantity(productData._id, quantity - 1);
    toast(
      quantity - 1 === 0
        ? `${productData.name} removed from cart`
        : `${productData.name} updated in cart`,
      {
        icon: quantity - 1 === 0 ? "🗑️" : "🛒",
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      },
    );
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!productData && products.length > 0)
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-gray-500 dark:text-gray-400">Product not found.</p>
        </div>
        <Footer />
      </>
    );

  if (!productData)
    return (
      <>
        <Navbar />
        <ProductDetailSkeleton />
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10 dark:bg-gray-900 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image gallery */}
          <div className="px-5 lg:px-16 xl:px-20">
            <div
              className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 cursor-zoom-in"
              onClick={() =>
                openLightbox(
                  productData.image.indexOf(mainImage || productData.image[0]),
                )
              }
            >
              <Image
                src={mainImage || productData.image[0]}
                alt={productData.name}
                className="w-full h-auto object-cover mix-blend-multiply dark:mix-blend-normal"
                width={1280}
                height={720}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`cursor-pointer rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 transition ${
                    (mainImage || productData.image[0]) === image
                      ? "border-orange-500"
                      : "border-transparent hover:border-orange-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productData.name} ${index + 1}`}
                    className="w-full h-auto object-cover mix-blend-multiply dark:mix-blend-normal"
                    width={300}
                    height={300}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Click main image to zoom
            </p>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800 dark:text-gray-100 mb-4">
              {productData.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Image
                    key={i}
                    className="h-4 w-4"
                    src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                  />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400">(4.5)</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              {productData.description}
            </p>
            <p className="text-3xl font-medium mt-6 dark:text-gray-100">
              ${productData.offerPrice}
              <span className="text-base font-normal text-gray-400 line-through ml-2">
                ${productData.price}
              </span>
            </p>
            <hr className="border-gray-200 dark:border-gray-700 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  {[
                    ["Brand", "Generic"],
                    ["Color", "Multi"],
                    ["Category", productData.category],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="text-gray-600 dark:text-gray-400 font-medium pr-6 py-1">
                        {k}
                      </td>
                      <td className="text-gray-500 dark:text-gray-500">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cart Controls */}
            <div className="flex items-center mt-10 gap-4">
              {quantity === 0 ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart();
                      router.push("/cart");
                    }}
                    className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
                  >
                    Buy now
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center border border-orange-600 rounded w-full">
                    <button
                      onClick={handleDecrease}
                      className="flex-1 py-3.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition text-xl font-bold"
                    >
                      −
                    </button>
                    <span className="px-6 py-3.5 text-gray-700 dark:text-gray-200 font-medium border-x border-orange-600">
                      {quantity}
                    </span>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => router.push("/cart")}
                    className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
                  >
                    Go to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        <div className="flex flex-col items-center pb-14">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium dark:text-gray-100">
              Featured <span className="text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 w-full">
            {products
              .filter((p) => p._id !== productData._id)
              .slice(0, 5)
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={productData.image}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      <Footer />
    </>
  );
};

export default ProductPage;
