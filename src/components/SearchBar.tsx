"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/contexts/LanguageContext";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div 
      onClick={() => router.push("/search")}
      className="relative flex items-center w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-2 cursor-pointer interactive group"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
        <Search className="w-5 h-5" />
      </div>
      
      <div className="flex-1 px-4">
        <p className="text-sm font-bold text-slate-800">{t("searchPlaceholder")}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t("searchSubtitle")}</p>
      </div>

      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors mr-1">
        <SlidersHorizontal className="w-4 h-4" />
      </div>
    </div>
  );
}
