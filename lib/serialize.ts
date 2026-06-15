// lib/serialize.ts
import type {
  Role,
  ApplicationStatus,
  ShippingAddress as PrismaShippingAddress,
  SystemSettings as PrismaSystemSettings,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  ShippingAddress as PrismaShippingAddressFull,
  Product as PrismaProduct,
  ProductImage as PrismaProductImage,
  Store as PrismaStore,
} from "@prisma/client";

// ============================================
// User Serialization (for navbar & profile)
// ============================================

// The exact shape returned by the navbar query
export interface SerializableUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  sellerApplication: { status: ApplicationStatus } | null;
  store: { id: string; slug: string } | null;
}

export function serializeUser(
  user: SerializableUser | null,
): SerializedUser | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    hasPendingApplication: user.sellerApplication?.status === "PENDING",
    storeSlug: user.store?.slug,
  };
}

// ============================================
// Address Serialization
// ============================================

// For address LIST views (my-addresses page, checkout)
export function serializeAddressList(
  addresses: PrismaShippingAddress[],
): SerializedAddress[] {
  return addresses.map((addr) => ({
    id: addr.id,
    userId: addr.userId,
    fullName: addr.fullName,
    phone: addr.phone,
    address: addr.address,
    city: addr.city ?? undefined,
    state: addr.state ?? undefined,
    pincode: addr.pincode ?? undefined,
    isDefault: addr.isDefault,
    createdAt: addr.createdAt.toISOString(),
    updatedAt: addr.updatedAt.toISOString(),
  }));
}

// For single address details
export function serializeAddressDetails(
  address: PrismaShippingAddress,
): SerializedAddress {
  return {
    id: address.id,
    userId: address.userId,
    fullName: address.fullName,
    phone: address.phone,
    address: address.address,
    city: address.city ?? undefined,
    state: address.state ?? undefined,
    pincode: address.pincode ?? undefined,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

// ============================================
// Settings Serialization
// ============================================

export function serializeSettings(
  settings: PrismaSystemSettings | null,
): SerializedSettings | null {
  if (!settings) return null;

  return {
    id: settings.id,
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    maintenanceMode: settings.maintenanceMode,
    allowNewRegistrations: settings.allowNewRegistrations,
    maxOrderAmount: Number(settings.maxOrderAmount),
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    shippingFee: Number(settings.shippingFee),
    freeShippingThreshold: settings.freeShippingThreshold
      ? Number(settings.freeShippingThreshold)
      : null,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

// ============================================
// Product Serialization
// ============================================

// Type for product with relations
interface ProductWithRelations extends PrismaProduct {
  images: PrismaProductImage[];
  store: PrismaStore | null;
}

// For product LIST views (homepage, products page)
export function serializeProductList(
  products: ProductWithRelations[],
): SerializedProduct[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    stock: product.stock,
    category: product.category,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    tags: product.tags,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    image: product.images[0]?.url ?? "/placeholder-product.png",
    images: product.images.map((img) => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      alt: img.alt,
      position: img.position,
      createdAt: img.createdAt.toISOString(),
    })),
    storeId: product.storeId,
    seller: product.store
      ? {
          id: product.store.id,
          name: product.store.name,
          slug: product.store.slug,
          rating: Number(product.store.rating),
        }
      : undefined,
  }));
}

// For single product detail view
export function serializeProductDetail(
  product: ProductWithRelations,
): SerializedProductDetail {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    stock: product.stock,
    category: product.category,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    tags: product.tags,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    image: product.images[0]?.url ?? "/placeholder-product.png",
    images: product.images.map((img) => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      alt: img.alt,
      position: img.position,
      createdAt: img.createdAt.toISOString(),
    })),
    storeId: product.storeId,
    seller: product.store
      ? {
          id: product.store.id,
          name: product.store.name,
          slug: product.store.slug,
          rating: Number(product.store.rating),
          logo: product.store.logo,
          totalSales: product.store.totalSales,
        }
      : undefined,
  };
}

// ============================================
// Order Serialization
// ============================================

// Base type for order with items (shared between list and detail)
interface OrderWithItems extends PrismaOrder {
  items: (PrismaOrderItem & {
    product: {
      name: string;
      images: { url: string }[];
    };
  })[];
}

// Full order type with shipping address (for detail view)
interface OrderWithRelations extends OrderWithItems {
  shippingAddress: PrismaShippingAddressFull | null;
}

// For order LIST views (my-orders page) - only needs items, no address
export function serializeOrderList(
  orders: OrderWithItems[],
): SerializedOrderList[] {
  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      price: Number(item.unitPrice),
    })),
  }));
}

// For single order detail view - requires full order with address
export function serializeOrderDetail(
  order: OrderWithRelations,
): SerializedOrderDetail {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    totalAmount: Number(order.totalAmount),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    paymentMethod: order.paymentMethod,
    paymentReference: order.paymentReference,
    notes: order.notes,
    invoiceUrl: order.invoiceUrl,
    emailSent: order.emailSent,
    notificationSent: order.notificationSent,
    paidAt: order.paidAt?.toISOString() || null,
    shippingAddress: order.shippingAddress
      ? {
          fullName: order.shippingAddress.fullName,
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.pincode,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0]?.url || null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      status: item.status,
    })),
  };
}

// ============================================
// EXPORTED TYPES (for use in client components)
// ============================================

export interface SerializedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  hasPendingApplication: boolean;
  storeSlug?: string;
}

export interface SerializedAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string | undefined;
  state: string | undefined;
  pincode: string | undefined;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedSettings {
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

// Single source of truth for SerializedProduct
export interface SerializedProduct {
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
  image: string;
  images: {
    id: string;
    productId: string;
    url: string;
    alt: string | null;
    position: number;
    createdAt: string;
  }[];
  storeId: string;
  seller?: {
    id: string;
    name: string;
    slug: string;
    rating?: number;
  };
}

// Product detail extends product with additional fields
export interface SerializedProductDetail extends SerializedProduct {
  description: string | null;
  seller?: {
    id: string;
    name: string;
    slug: string;
    rating?: number;
    logo?: string | null;
    totalSales?: number;
  };
}

export interface SerializedOrderList {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export interface SerializedOrderDetail {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  paymentMethod: string | null;
  paymentReference: string | null;
  notes: string | null;
  invoiceUrl: string | null;
  emailSent: boolean;
  notificationSent: boolean;
  paidAt: string | null;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: {
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    status: string;
  }[];
}
