"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import FilterChip from "@/components/FilterChip";
import { defaultCategories, Listing } from "@/data/mockListings";
import { Search as SearchIcon, ChevronLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { fetchCategories, fetchListings } from "@/lib/supabase/api";
import { getCategoryDisplayLabel } from "@/lib/categoryIconMapper";
import { useLanguage } from "@/contexts/LanguageContext";

function SearchContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isVip = searchParams.get("vip") === "true";
  const categoryParam = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryParam || "Barchasi");
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    fetchListings().then(data => {
      setListings(data);
    });
    fetchCategories().then(setCategories);
  }, []);

  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        listing.name.toLowerCase().includes(normalizedSearchQuery) ||
        listing.category.toLowerCase().includes(normalizedSearchQuery) ||
        listing.district.toLowerCase().includes(normalizedSearchQuery);
      const matchesCategory =
        activeCategory === "Barchasi" || listing.category === activeCategory;
      const matchesVip = !isVip || listing.isVip;
      return matchesSearch && matchesCategory && matchesVip;
    });
  }, [activeCategory, isVip, listings, normalizedSearchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-24 transition-colors duration-200">
      {/* Search Header */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 shadow-sm flex items-center gap-3 transition-colors duration-200">
        <Link href="/" className="interactive text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
          <SearchIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Santexnik, Toshkent..." 
            className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button className="interactive w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1">
        {/* Categories Horizontal Scroll */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="flex overflow-x-auto no-scrollbar px-4 gap-2 snap-x">
            <div className="snap-start">
               <FilterChip 
                 label={language === "uz" ? "Barchasi" : "Все"} 
                 isActive={activeCategory === "Barchasi"} 
                 onClick={() => setActiveCategory("Barchasi")} 
               />
            </div>
            {categories.map((c) => (
              <div key={c} className="snap-start">
                 <FilterChip 
                   label={getCategoryDisplayLabel(c, language)} 
                   isActive={activeCategory === c} 
                   onClick={() => setActiveCategory(c)} 
                 />
              </div>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="px-5 py-4 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
           <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400">Natijalar: {filteredListings.length} ta</h2>
        </div>

        {/* Results List */}
        <div className="px-5 py-2 flex flex-col gap-4">
           {filteredListings.length > 0 ? (
             filteredListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                   <ListingCard listing={listing} />
                </motion.div>
             ))
           ) : (
             <div className="py-12 flex flex-col items-center justify-center text-center">
                <SearchIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Hech narsa topilmadi</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Boshqa so'z bilan qidirib ko'ring</p>
             </div>
           )}
        </div>
      </main>

        <BottomNav />
      </div>
    );
  }

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500">Yuklanmoqda...</div>}>
      <SearchContent />
    </Suspense>
  );
}
