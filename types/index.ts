// types/index.ts
import {
  Role,
  OrderStatus as PrismaOrderStatus,
  ItemStatus,
  ApplicationStatus,
  CouponType,
  NotificationType as PrismaNotificationType,
} from "@prisma/client";

// Re-export Prisma enums with aliases to avoid conflicts
export { Role, ItemStatus, ApplicationStatus, CouponType };
export { PrismaOrderStatus as OrderStatus };
export { PrismaNotificationType as NotificationType };

// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
  store?: Store | null;
  sellerApplication?: SellerApplication | null;
}

// Store types
export interface Store {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  phone: string | null;
  rating: number;
  totalSales: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  products?: Product[];
}

// Seller Application types
export interface SellerApplication {
  id: string;
  userId: string;
  storeName: string;
  phone: string;
  description: string | null;
  status: ApplicationStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Product types
export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  offerPrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    rating?: number;
    logo?: string | null;
    totalSales?: number;
  };
  images?: ProductImage[];
  reviews?: Review[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  offerPrice: number | null;
  stock: number;
  category: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  image: string; // primary image URL
  images: ProductImage[];
  seller?: {
    id: string;
    name: string;
    slug: string;
    rating?: number;
  };
  storeId: string;
  description?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  position: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
}

// Cart types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  user?: User;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product?: Product;
  user?: User;
}

export interface CartItems {
  [productId: string]: number;
}

// Address types
export interface ShippingAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  orders?: Order[];
}

export type Address = ShippingAddress;

// Coupon types
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  orders?: Order[];
}

// Order types - updated with new fields
export interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  couponId: string | null;
  status: PrismaOrderStatus;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  notes: string | null;
  invoiceUrl: string | null;
  emailSent: boolean;
  notificationSent: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  coupon?: Coupon | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  storeId: string;
  quantity: number;
  unitPrice: number; // ← Keep as unitPrice (not price)
  total: number; // ← Add total
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  product?: Product;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: PrismaNotificationType;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
  user?: User;
}

export type AppNotification = Notification;

// System Settings - updated with new fields
export interface SystemSettings {
  id: number;
  siteName: string;
  siteDescription: string | null;
  contactEmail: string;
  contactPhone: string | null;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxOrderAmount: number;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingThreshold: number | null;
  createdAt: string;
  updatedAt: string;
}

// Component prop types
export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string | string[];
    images?: ProductImage[];
    seller?: { name: string | null };
    store?: { name: string };
    category?: string;
    offerPrice?: number | null;
    rating?: number;
    slug?: string;
  };
}

// Form types
export interface AddressForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

// Legacy/Component specific types
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

export interface LocalProduct {
  id: number;
  name: string;
  description: string;
  rating: number;
  price: string;
  imgSrc: string;
}

export type { ProductCategory } from "@/lib/constants";

// Helper type for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types for product search
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  sortBy?: "price_asc" | "price_desc" | "rating_desc" | "newest";
  search?: string;
  page?: number;
  limit?: number;
}

// Invoice types
export interface InvoiceData {
  orderId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentReference?: string;
  status: PrismaOrderStatus;
}

// Webhook payload types
export interface OrderWebhookPayload {
  event: "order.created" | "order.updated" | "order.cancelled";
  orderId: string;
  userId: string;
  timestamp: string;
  data?: Partial<Order>;
}

// Analytics types
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<PrismaOrderStatus, number>;
  topProducts: Array<{ productId: string; name: string; quantity: number }>;
  salesByCategory: Array<{ category: string; total: number }>;
}

// Email template types
export interface OrderEmailData {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  invoiceUrl?: string;
  orderDate: string;
}
