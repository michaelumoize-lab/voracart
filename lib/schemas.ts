// lib/schemas.ts
import { z } from "zod";

// Product
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  offerPrice: z
    .number()
    .positive("Offer price must be positive")
    .optional()
    .nullable(),
  stock: z.number().int().min(0).default(0),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
  image: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

// Address
export const createAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z
    .string()
    .min(7, "Phone number is too short")
    .max(15, "Phone number is too long"),
  pincode: z.string().min(4, "Pincode is required"),
  area: z.string().min(5, "Area is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});

// Cart
export const updateCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"), // Make sure this is .number()
});

// Order
export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Order must have at least one item"),
});
// Order status update (seller only)
export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["PENDING", "PLACED", "SHIPPED", "DELIVERED"]),
});

export const sellerApplicationSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(15, "Phone number is too long"),
});

// Types inferred from schemas
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
