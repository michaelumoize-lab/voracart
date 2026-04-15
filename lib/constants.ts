// lib/constants.ts
export const PRODUCT_CATEGORIES = [
  "Earphone",
  "Headphone",
  "Watch",
  "Smartphone",
  "Laptop",
  "Camera",
  "Accessories"
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Helper function to check if a category is valid
export const isValidCategory = (category: string): category is ProductCategory => {
  return PRODUCT_CATEGORIES.includes(category as ProductCategory);
};