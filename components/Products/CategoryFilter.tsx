// components/Products/CategoryFilter.tsx
"use client";

import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  value: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <label className="sr-only" htmlFor="category-filter">
      Category
      <select
        id="category-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="all">All Categories</option>
        {PRODUCT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </label>
  );
}
