"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { ChevronLeft, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchListings } from "@/lib/supabase/api";
import { Listing } from "@/data/mockListings";

export default function ListingsPage() {
  const [sortBy, setSortBy] = useState<"vip" | "rating" | "new">("vip");
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchListings().then(data => {
      setListings(data);
    });
  }, []);

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === "vip") {
      return (a.isVip === b.isVip) ? 0 : a.isVip ? -1 : 1;
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    if (sortBy === "new") {
      return Number(b.id) - Number(a.id);
    }
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 px-4 py-4 shadow-sm flex items-center justify-between">
        <Link href="/" className="interactive text-slate-500 hover:text-slate-800">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">Barcha e'lonlar</h1>
        <div className="w-6" /> {/* Placeholder for center alignment */}
      </header>

      <main className="flex-1 px-5 py-4">
        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-4">
           <span className="text-sm font-semibold text-slate-500">{sortedListings.length} ta natija</span>
           <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select 
                className="bg-transparent text-sm font-bold text-blue-600 outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "vip" | "rating" | "new")}
              >
                 <option value="vip">VIP oldin</option>
                 <option value="rating">Reytingi yuqori</option>
                 <option value="new">Yangi e'lonlar</option>
              </select>
           </div>
        </div>

        {/* Listings */}
        <div className="flex flex-col gap-4">
           {sortedListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                 <ListingCard listing={listing} featured={listing.isVip} priority={i === 0} />
              </motion.div>
           ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
