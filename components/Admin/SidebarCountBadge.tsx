// components/Seller/SidebarCountBadge.tsx
"use client";
import React from "react";

interface SidebarCountBadgeProps {
  count: number;
}

const SidebarCountBadge = ({ count }: SidebarCountBadgeProps) => {
  if (count <= 0) return null;

  return (
    <span className="ml-auto min-w-[20px] h-5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-1 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default SidebarCountBadge;