"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, HeartCrack, House } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/data/mockListings";
import { fetchUserFavoriteListings, fetchValidFavoriteListings } from "@/lib/supabase/api";
import { useFavorites } from "@/hooks/useFavorites";

const GUEST_FAVORITES_STORAGE_KEY = "tezkorusta_favorites";
const SAVED_FETCH_TIMEOUT_MS = 8_000;

function getGuestFavoriteIds() {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(GUEST_FAVORITES_STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as Array<{ id?: string }>;
    return parsed
      .map((item) => item?.id?.trim())
      .filter((id): id is string => Boolean(id));
  } catch (error) {
    console.error("Failed to parse guest favorites", error);
    return [];
  }
}

function setGuestFavoritesFromListings(listings: Listing[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = listings.map((listing) => ({ id: listing.id }));
  window.localStorage.setItem(GUEST_FAVORITES_STORAGE_KEY, JSON.stringify(payload));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("Saved listings fetch timeout")), timeoutMs);
    }),
  ]);
}

function SavedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`saved-skeleton-${index}`}
          className="overflow-hidden rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm animate-pulse"
        >
          <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 h-5 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SavedPage() {
  const { userId, favoriteIds } = useFavorites();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const favoriteKey = useMemo(() => favoriteIds.join("|"), [favoriteIds]);

  useEffect(() => {
    let isMounted = true;

    const loadSavedListings = async () => {
      setIsLoading(true);

      try {
        const listings = userId
          ? await withTimeout(fetchUserFavoriteListings(userId), SAVED_FETCH_TIMEOUT_MS)
          : (
              await withTimeout(
                fetchValidFavoriteListings(getGuestFavoriteIds()),
                SAVED_FETCH_TIMEOUT_MS
              )
            ).listings;

        if (!isMounted) {
          return;
        }

        const validListings = listings.filter((listing) => Boolean(listing));
        setSavedListings(validListings);

        if (!userId) {
          setGuestFavoritesFromListings(validListings);
        }
      } catch (error) {
        console.error("Failed to load saved listings", error);

        if (!isMounted) {
          return;
        }

        setSavedListings([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSavedListings();

    return () => {
      isMounted = false;
    };
  }, [favoriteKey, userId]);

  const hasListings = savedListings.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4 shadow-sm flex items-center justify-between transition-colors duration-200">
        <Link
          href="/profile"
          className="interactive text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Saqlanganlar</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 px-5 py-6">
        {isLoading ? (
          <SavedSkeleton />
        ) : hasListings ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {savedListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <ListingCard listing={listing} priority={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-16 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-10 text-center shadow-sm"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <HeartCrack className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Hech qanday saqlangan e&apos;lon yo&apos;q
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              E&apos;lonlarni yurakcha orqali saqlang
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)] transition hover:bg-blue-700"
            >
              <House className="h-4 w-4" />
              Bosh sahifaga qaytish
            </Link>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
