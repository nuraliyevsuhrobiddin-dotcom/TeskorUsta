"use client";

import { Wrench, Zap, MapPin, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-slate-100/50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-1.5 interactive group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-premium">
            <Wrench className="w-4 h-4 absolute top-1.5 left-1.5 opacity-90 group-hover:rotate-12 transition-transform" />
            <Zap className="w-3.5 h-3.5 absolute bottom-1.5 right-1.5 text-yellow-300" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight text-slate-800">
            Tezkor<span className="text-blue-600">Usta</span>
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Location Dropdown Placeholder */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-100 interactive cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-slate-700">Toshkent</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Language Switcher */}
          <div onClick={toggleLanguage} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 interactive cursor-pointer">
            <span className="text-xs font-bold text-slate-700">{language.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
