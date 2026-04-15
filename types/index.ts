// types/index.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  userId: string;
  category: string;
  offerPrice?: number;
  stock: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name?: string | null; // ✅ Allow undefined or null
    whatsappNumber?: string;
  };
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    seller?: { name: string };
    category?: string;
  };
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
  __v: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  _id: string;
}

export type OrderStatus = "PENDING" | "PLACED" | "SHIPPED" | "DELIVERED";

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  address: Address;
  addressId: string;
  status: OrderStatus;
  date: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  imageUrl: string;
  cartItems: Record<string, number>;
}

export interface CartItems {
  [itemId: string]: number;
}

export interface LocalProduct {
  id: number;
  name: string;
  description: string;
  rating: number;
  price: string;
  imgSrc: string;
}

export interface FeaturedItem {
  id: string;
  image: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SliderItem {
  id: number;
  title: string;
  offer: string;
  buttonText1: string;
  buttonText2: string;
  imgSrc: string;
}

export interface AddressForm {
  fullName: string;
  phoneNumber: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
}

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_STATUS_UPDATED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "NEW_APPLICATION";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export type ProductCategory =
  | "Earphone"
  | "Headphone"
  | "Watch"
  | "Smartphone"
  | "Laptop"
  | "Camera"
  | "Accessories";
