// components/ui/SidebarCountBadge.tsx
"use client";
import React from "react";

interface SidebarCountBadgeProps {
  count: number;
  max?: number; // optional – default 99
}

const SidebarCountBadge = ({ count, max = 99 }: SidebarCountBadgeProps) => {
  if (count <= 0) return null;

  const display = count > max ? `${max}+` : count;

  return (
    <span className="ml-auto min-w-5 h-5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-1 leading-none">
      {display}
    </span>
  );
};

export default SidebarCountBadge;
