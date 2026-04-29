"use client";

import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export default function FilterChip({ label, isActive, onClick, icon }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all interactive",
        isActive 
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      )}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {label}
    </button>
  );
}
