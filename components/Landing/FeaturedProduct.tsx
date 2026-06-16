import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import { FeaturedItem } from "@/types";
import { StaticImageData } from "next/image";
import { ArrowRight, Headphones, Music, Laptop } from "lucide-react";

const products: FeaturedItem[] = [
  {
    id: "1",
    image: assets.girl_with_headphone_image as unknown as string,
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
    icon: Headphones,
  },
  {
    id: "2",
    image: assets.girl_with_earphone_image as unknown as string,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
    icon: Music,
  },
  {
    id: "3",
    image: assets.boy_with_laptop_image as unknown as string,
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
    icon: Laptop,
  },
];

const featuredImages: StaticImageData[] = [
  assets.girl_with_headphone_image,
  assets.girl_with_earphone_image,
  assets.boy_with_laptop_image,
];

export default function FeaturedProduct() {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Products</p>
        <div className="w-28 h-0.5 bg-primary mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, title, description, icon: Icon }, index) => (
          <div key={id} className="relative group">
            <Image
              src={featuredImages[index]}
              alt={title}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <p className="font-medium text-xl lg:text-2xl">{title}</p>
              </div>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>

              <Link
                href={`/products/${id}`}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded transition-colors"
              >
                Buy now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
