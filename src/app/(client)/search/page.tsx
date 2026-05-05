"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import FilterChip from "@/components/FilterChip";
import { defaultCategories, districts, Listing } from "@/data/mockListings";
import { Search as SearchIcon, ChevronLeft, SlidersHorizontal, X } from "lucide-react";
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
  const [activeDistrict, setActiveDistrict] = useState("Barchasi");
  const [draftCategory, setDraftCategory] = useState(categoryParam || "Barchasi");
  const [draftDistrict, setDraftDistrict] = useState("Barchasi");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
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
      const matchesDistrict =
        activeDistrict === "Barchasi" || listing.district === activeDistrict;
      const matchesVip = !isVip || listing.isVip;
      return matchesSearch && matchesCategory && matchesDistrict && matchesVip;
    });
  }, [activeCategory, activeDistrict, isVip, listings, normalizedSearchQuery]);

  const hasExtraFilters = activeCategory !== "Barchasi" || activeDistrict !== "Barchasi";
  const activeFilterCount =
    (activeCategory !== "Barchasi" ? 1 : 0) + (activeDistrict !== "Barchasi" ? 1 : 0);

  const openFilters = () => {
    setDraftCategory(activeCategory);
    setDraftDistrict(activeDistrict);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setActiveCategory(draftCategory);
    setActiveDistrict(draftDistrict);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftCategory("Barchasi");
    setDraftDistrict("Barchasi");
    setActiveCategory("Barchasi");
    setActiveDistrict("Barchasi");
    setIsFilterOpen(false);
  };

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
        <button
          type="button"
          onClick={openFilters}
          className={`interactive relative w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
            hasExtraFilters
              ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
              : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
          aria-label="Filtrlarni ochish"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFilterCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-black text-white">
              {activeFilterCount}
            </span>
          ) : null}
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
           {activeDistrict !== "Barchasi" ? (
             <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
               {activeDistrict}
             </span>
           ) : null}
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
                   <ListingCard listing={listing} priority={i === 0} />
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

      {isFilterOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/50 px-3 pb-3 pt-16 sm:items-center sm:justify-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Filtrlarni yopish"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Filtrlar</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Kategoriya va tumanni tanlang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Yopish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Kategoriya
                </span>
                <select
                  value={draftCategory}
                  onChange={(event) => setDraftCategory(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="Barchasi">{language === "uz" ? "Barchasi" : "Все"}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryDisplayLabel(category, language)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tuman
                </span>
                <select
                  value={draftDistrict}
                  onChange={(event) => setDraftDistrict(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="Barchasi">Barchasi</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Tozalash
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Qo&apos;llash
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
