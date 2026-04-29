"use client";

import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";

export default function SavedPage() {
  const { favorites } = useFavorites();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4 shadow-sm flex items-center justify-between transition-colors duration-200">
        <Link href="/profile" className="interactive text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Saqlanganlar</h1>
        <div className="w-6" /> {/* Placeholder */}
      </header>

      <main className="flex-1 px-5 py-6">
        {favorites.length > 0 ? (
          <div className="flex flex-col gap-4">
            {favorites.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💔</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Hozircha bo'sh</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Siz hali hech qanday e'lonni saqlamadingiz.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
