// lib/constants.ts
export const PRODUCT_CATEGORIES = [
  // Electronics
  "Earphone",
  "Headphone",
  "Smartphone",
  "Laptop",
  "Tablet",
  "Camera",
  "Accessories",
  "Gaming",
  "Smart Home",
  // Fashion
  "Men's Clothing",
  "Women's Clothing",
  "Shoes",
  "Bags",
  "Jewelry",
  // Home & Living
  "Furniture",
  "Kitchen",
  "Home Decor",
  // Sports & Outdoors
  "Sports",
  "Fitness",
  // Beauty & Health
  "Beauty",
  "Health",
  // Others
  "Toys",
  "Books",
  "Pet Supplies",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Helper function to check if a category is valid
export const isValidCategory = (
  category: string,
): category is ProductCategory => {
  return PRODUCT_CATEGORIES.includes(category as ProductCategory);
};
