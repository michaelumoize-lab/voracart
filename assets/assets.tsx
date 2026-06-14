import React, { JSX } from "react";
import { StaticImageData } from "next/image";
import logo from "./logo.png";
import search_icon from "./search_icon.svg";
import user_icon from "./user_icon.svg";
import cart_icon from "./cart_icon.svg";
import add_icon from "./add_icon.svg";
import order_icon from "./order_icon.svg";
import instagram_icon from "./instagram_icon.svg";
import facebook_icon from "./facebook_icon.svg";
import twitter_icon from "./twitter_icon.svg";
import box_icon from "./box_icon.svg";
import product_list_icon from "./product_list_icon.svg";
import menu_icon from "./menu_icon.svg";
import arrow_icon from "./arrow_icon.svg";
import increase_arrow from "./increase_arrow.svg";
import decrease_arrow from "./decrease_arrow.svg";
import arrow_right_icon_colored from "./arrow_right_icon_colored.svg";
import my_location_image from "./my_location_image.svg";
import arrow_icon_white from "./arrow_icon_white.svg";
import heart_icon from "./heart_icon.svg";
import star_icon from "./star_icon.svg";
import redirect_icon from "./redirect_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import header_headphone_image from "./header_headphone_image.png";
import header_playstation_image from "./header_playstation_image.png";
import header_macbook_image from "./header_macbook_image.png";
import macbook_image from "./macbook_image.png";
import bose_headphone_image from "./bose_headphone_image.png";
import apple_earphone_image from "./apple_earphone_image.png";
import samsung_s23phone_image from "./samsung_s23phone_image.png";
import venu_watch_image from "./venu_watch_image.png";
import upload_area from "./upload_area.png";
import cannon_camera_image from "./cannon_camera_image.png";
import sony_airbuds_image from "./sony_airbuds_image.png";
import asus_laptop_image from "./asus_laptop_image.png";
import projector_image from "./projector_image.png";
import playstation_image from "./playstation_image.png";
import girl_with_headphone_image from "./girl_with_headphone_image.png";
import girl_with_earphone_image from "./girl_with_earphone_image.png";
import md_controller_image from "./md_controller_image.png";
import sm_controller_image from "./sm_controller_image.png";
import jbl_soundbox_image from "./jbl_soundbox_image.png";
import boy_with_laptop_image from "./boy_with_laptop_image.png";
import checkmark from "./checkmark.png";
import product_details_page_apple_earphone_image1 from "./product_details_page_apple_earphone_image1.png";
import product_details_page_apple_earphone_image2 from "./product_details_page_apple_earphone_image2.png";
import product_details_page_apple_earphone_image3 from "./product_details_page_apple_earphone_image3.png";
import product_details_page_apple_earphone_image4 from "./product_details_page_apple_earphone_image4.png";
import product_details_page_apple_earphone_image5 from "./product_details_page_apple_earphone_image5.png";
import { Product, User, Order, Address } from "@/types";

export interface Assets {
  logo: StaticImageData;
  search_icon: StaticImageData;
  user_icon: StaticImageData;
  cart_icon: StaticImageData;
  add_icon: StaticImageData;
  order_icon: StaticImageData;
  instagram_icon: StaticImageData;
  facebook_icon: StaticImageData;
  twitter_icon: StaticImageData;
  box_icon: StaticImageData;
  product_list_icon: StaticImageData;
  menu_icon: StaticImageData;
  arrow_icon: StaticImageData;
  increase_arrow: StaticImageData;
  decrease_arrow: StaticImageData;
  arrow_right_icon_colored: StaticImageData;
  my_location_image: StaticImageData;
  arrow_icon_white: StaticImageData;
  heart_icon: StaticImageData;
  star_icon: StaticImageData;
  redirect_icon: StaticImageData;
  star_dull_icon: StaticImageData;
  header_headphone_image: StaticImageData;
  header_playstation_image: StaticImageData;
  header_macbook_image: StaticImageData;
  macbook_image: StaticImageData;
  bose_headphone_image: StaticImageData;
  apple_earphone_image: StaticImageData;
  samsung_s23phone_image: StaticImageData;
  venu_watch_image: StaticImageData;
  upload_area: StaticImageData;
  cannon_camera_image: StaticImageData;
  sony_airbuds_image: StaticImageData;
  asus_laptop_image: StaticImageData;
  projector_image: StaticImageData;
  playstation_image: StaticImageData;
  girl_with_headphone_image: StaticImageData;
  girl_with_earphone_image: StaticImageData;
  md_controller_image: StaticImageData;
  sm_controller_image: StaticImageData;
  jbl_soundbox_image: StaticImageData;
  boy_with_laptop_image: StaticImageData;
  checkmark: StaticImageData;
  product_details_page_apple_earphone_image1: StaticImageData;
  product_details_page_apple_earphone_image2: StaticImageData;
  product_details_page_apple_earphone_image3: StaticImageData;
  product_details_page_apple_earphone_image4: StaticImageData;
  product_details_page_apple_earphone_image5: StaticImageData;
}

export const assets: Assets = {
  logo,
  search_icon,
  user_icon,
  cart_icon,
  add_icon,
  order_icon,
  instagram_icon,
  facebook_icon,
  twitter_icon,
  box_icon,
  product_list_icon,
  menu_icon,
  arrow_icon,
  increase_arrow,
  decrease_arrow,
  arrow_right_icon_colored,
  my_location_image,
  arrow_icon_white,
  heart_icon,
  star_icon,
  redirect_icon,
  star_dull_icon,
  header_headphone_image,
  header_playstation_image,
  header_macbook_image,
  macbook_image,
  bose_headphone_image,
  apple_earphone_image,
  samsung_s23phone_image,
  venu_watch_image,
  upload_area,
  cannon_camera_image,
  sony_airbuds_image,
  asus_laptop_image,
  projector_image,
  playstation_image,
  girl_with_headphone_image,
  girl_with_earphone_image,
  md_controller_image,
  sm_controller_image,
  jbl_soundbox_image,
  boy_with_laptop_image,
  checkmark,
  product_details_page_apple_earphone_image1,
  product_details_page_apple_earphone_image2,
  product_details_page_apple_earphone_image3,
  product_details_page_apple_earphone_image4,
  product_details_page_apple_earphone_image5,
};

export const BagIcon = () => (
  <svg
    className="w-5 h-5 text-gray-800"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9 10V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v4m3-2 .917 11.923A1 1 0 0 1 17.92 21H6.08a1 1 0 0 1-.997-1.077L6 8h12Z"
    />
  </svg>
);

export const CartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.75 0.75H3.75L5.76 10.7925C5.82858 11.1378 6.01643 11.448 6.29066 11.6687C6.56489 11.8895 6.90802 12.0067 7.26 12H14.55C14.902 12.0067 15.2451 11.8895 15.5193 11.6687C15.7936 11.448 15.9814 11.1378 16.05 10.7925L17.25 4.5H4.5M7.5 15.75C7.5 16.1642 7.16421 16.5 6.75 16.5C6.33579 16.5 6 16.1642 6 15.75C6 15.3358 6.33579 15 6.75 15C7.16421 15 7.5 15.3358 7.5 15.75ZM15.75 15.75C15.75 16.1642 15.4142 16.5 15 16.5C14.5858 16.5 14.25 16.1642 14.25 15.75C14.25 15.3358 14.5858 15 15 15C15.4142 15 15.75 15.3358 15.75 15.75Z"
      stroke="#4b5563"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <rect width="18" height="18" fill="white" />
    </defs>
  </svg>
);

export const BoxIcon = () => (
  <svg
    className="w-5 h-5 text-gray-800"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M10 21v-9m3-4H7.5a2.5 2.5 0 1 1 0-5c1.5 0 2.875 1.25 3.875 2.5M14 21v-9m-9 0h14v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8ZM4 8h16a1 1 0 0 1 1 1v3H3V9a1 1 0 0 1 1-1Zm12.155-5c-3 0-5.5 5-5.5 5h5.5a2.5 2.5 0 0 0 0-5Z"
    />
  </svg>
);

export const HomeIcon = () => (
  <svg
    className="w-5 h-5 text-gray-800"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
    />
  </svg>
);

export const productsDummyData: any[] = [
  {
    _id: "67a1f4e43f34a77b6dde9144",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Apple AirPods Pro 2nd gen",
    description:
      "Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C) provide excellent sound, active noise cancellation, and a comfortable fit.",
    price: 499.99,
    offerPrice: 399.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/k4dafzhwhgcn5tnoylrw.webp",
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/j212frakb8hdrhvhajhg.webp",
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/imwuugqxsajuwqpkegb5.webp",
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/k1oqaslw5tb3ebw01vvj.webp",
    ],
    category: "Earphone",
    date: 1738667236865,
    __v: 0,
  },
  {
    _id: "67a1f52e3f34a77b6dde914a",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Bose QuietComfort 45",
    description:
      "The Bose QuietComfort 45 headphones are engineered for exceptional sound quality and unparalleled noise cancellation.",
    price: 429.99,
    offerPrice: 329.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/m16coelz8ivkk9f0nwrz.webp",
    ],
    category: "Headphone",
    date: 1738667310300,
    __v: 0,
  },
  {
    _id: "67a1f5663f34a77b6dde914c",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Samsung Galaxy S23",
    description:
      "The Samsung Galaxy S23 offers an all-encompassing mobile experience with its advanced AMOLED display.",
    price: 899.99,
    offerPrice: 799.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/xjd4eprpwqs7odbera1w.webp",
    ],
    category: "Smartphone",
    date: 1738667366224,
    __v: 0,
  },
  {
    _id: "67a1f5993f34a77b6dde914e",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Garmin Venu 2",
    description:
      "The Garmin Venu 2 smartwatch blends advanced fitness tracking with sophisticated design.",
    price: 399.99,
    offerPrice: 349.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/hdfi4u3fmprazpnrnaga.webp",
    ],
    category: "Earphone",
    date: 1738667417511,
    __v: 0,
  },
  {
    _id: "67a1f5ef3f34a77b6dde9150",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "PlayStation 5",
    description:
      "The PlayStation 5 takes gaming to the next level with ultra-HD graphics and a powerful 825GB SSD.",
    price: 599.99,
    offerPrice: 499.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/dd3l13vfoartrgbvkkh5.webp",
    ],
    category: "Accessories",
    date: 1738667503075,
    __v: 0,
  },
  {
    _id: "67a1f70c3f34a77b6dde9156",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Canon EOS R5",
    description:
      "The Canon EOS R5 is a game-changing mirrorless camera with a 45MP full-frame sensor.",
    price: 4199.99,
    offerPrice: 3899.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/r5h370zuujvrw461c6wy.webp",
    ],
    category: "Camera",
    date: 1738667788883,
    __v: 0,
  },
  {
    _id: "67a1f7c93f34a77b6dde915a",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "MacBook Pro 16",
    description:
      "The MacBook Pro 16, powered by Apple's M2 Pro chip, offers outstanding performance.",
    price: 2799.99,
    offerPrice: 2499.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/rzri7kytphxalrm9rubd.webp",
    ],
    category: "Laptop",
    date: 1738667977644,
    __v: 0,
  },
  {
    _id: "67a1f8363f34a77b6dde915c",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Sony WF-1000XM5",
    description:
      "Sony WF-1000XM5 true wireless earbuds deliver immersive sound with Hi-Res Audio.",
    price: 349.99,
    offerPrice: 299.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/e3zjaupyumdkladmytke.webp",
    ],
    category: "Earphone",
    date: 1738668086331,
    __v: 0,
  },
  {
    _id: "67a1f85e3f34a77b6dde915e",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "Samsung Projector 4k",
    description:
      "The Samsung 4K Projector offers an immersive cinematic experience with ultra-high-definition visuals.",
    price: 1699.99,
    offerPrice: 1499.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/qqdcly8a8vkyciy9g0bw.webp",
    ],
    category: "Accessories",
    date: 1738668126660,
    __v: 0,
  },
  {
    _id: "67a1fa4b3f34a77b6dde9166",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    name: "ASUS ROG Zephyrus G16",
    description:
      "The ASUS ROG Zephyrus G16 gaming laptop is powered by the Intel Core i9 processor.",
    price: 2199.99,
    offerPrice: 1999.99,
    image: [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/wig1urqgnkeyp4t2rtso.webp",
    ],
    category: "Laptop",
    date: 1738668619198,
    __v: 0,
  },
];

export const userDummyData: User = {
  id: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
  name: "GreatStack",
  email: "admin@example.com",
  emailVerified: false,
  image:
    "https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ycnlnUnFiUDBYT2dEZ2h1ZmRXcGlpdWV5OXoiLCJyaWQiOiJ1c2VyXzJzWkZIUzFVSUl5c0p5RFZ6Q3BRaFVoVElodyJ9",
  role: "admin",
  banned: false,
  banReason: null,
  banExpires: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const orderDummyData: any[] = [
  {
    _id: "67a20934b3db72db5cc77b2b",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    items: [
      {
        product: {
          _id: "67a1f4e43f34a77b6dde9144",
          userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
          name: "Apple AirPods Pro",
          description: "Apple AirPods Pro (2nd Gen) with MagSafe Case.",
          price: 499.99,
          offerPrice: 399.99,
          image: [
            "https://res.cloudinary.com/djbvf02yt/image/upload/v1738667237/lrllaprpos2pnp5c9pyy.png",
          ],
          category: "Earphone",
          date: 1738667236865,
          __v: 0,
        },
        quantity: 1,
        _id: "67a20934b3db72db5cc77b2c",
      },
    ],
    amount: 406.99,
    address: {
      _id: "67a1e4233f34a77b6dde9055",
      userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
      fullName: "GreatStack",
      phoneNumber: "0123456789",
      pincode: 654321,
      area: "Main Road , 123 Street, G Block",
      city: "City",
      state: "State",
      __v: 0,
    },
    status: "Order Placed",
    date: 1738672426822,
    __v: 0,
  },
];

export const addressDummyData: any[] = [
  {
    _id: "67a1e4233f34a77b6dde9055",
    userId: "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    fullName: "GreatStack",
    phoneNumber: "0123456789",
    pincode: 654321,
    area: "Main Road , 123 Street, G Block",
    city: "City",
    state: "State",
    __v: 0,
  },
];
