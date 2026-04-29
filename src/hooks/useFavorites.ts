"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  addFavorite,
  fetchUserFavoriteIds,
  migrateFavoriteIdsToSupabase,
  removeFavorite,
} from "@/lib/supabase/api";

const GUEST_FAVORITES_STORAGE_KEY = "tezkorusta_favorites";
const favoriteListeners = new Set<(snapshot: FavoriteSnapshot) => void>();

type FavoriteSnapshot = {
  favoriteIds: string[];
  userId: string | null;
  isLoading: boolean;
};

let favoriteSnapshot: FavoriteSnapshot = {
  favoriteIds: [],
  userId: null,
  isLoading: true,
};
let hydrationPromise: Promise<void> | null = null;
let authSubscriptionInitialized = false;

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

function setGuestFavoriteIds(favoriteIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = favoriteIds.map((favoriteId) => ({ id: favoriteId }));
  window.localStorage.setItem(GUEST_FAVORITES_STORAGE_KEY, JSON.stringify(payload));
}

function clearGuestFavorites() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GUEST_FAVORITES_STORAGE_KEY);
}

function readGuestSnapshot(): FavoriteSnapshot {
  return {
    userId: null,
    favoriteIds: getGuestFavoriteIds(),
    isLoading: false,
  };
}

type FavoritesHookState = {
  favoriteIds: string[];
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<boolean>;
  isLoading: boolean;
  userId: string | null;
  requireLoginForSave: () => void;
  refreshFavorites: () => Promise<void>;
};

function emitFavoriteSnapshot(nextSnapshot: FavoriteSnapshot) {
  favoriteSnapshot = nextSnapshot;
  favoriteListeners.forEach((listener) => listener(nextSnapshot));
}

export function useFavorites(): FavoritesHookState {
  const supabase = useMemo(() => createClient(), []);
  const [snapshot, setSnapshot] = useState<FavoriteSnapshot>(favoriteSnapshot);
  const hasMigratedGuestFavorites = useRef(false);

  const refreshFavorites = useCallback(async () => {
    emitFavoriteSnapshot({
      ...favoriteSnapshot,
      isLoading: true,
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      const isMissingSessionError =
        error.name === "AuthSessionMissingError" ||
        error.message.toLowerCase().includes("auth session missing");

      if (isMissingSessionError) {
        emitFavoriteSnapshot(readGuestSnapshot());
        return;
      }

      console.error("Error getting current user for favorites:", error);
      emitFavoriteSnapshot(readGuestSnapshot());
      return;
    }

    if (!user) {
      emitFavoriteSnapshot(readGuestSnapshot());
      return;
    }

    if (!hasMigratedGuestFavorites.current) {
      const guestFavoriteIds = getGuestFavoriteIds();

      if (guestFavoriteIds.length > 0) {
        const migrated = await migrateFavoriteIdsToSupabase(user.id, guestFavoriteIds);
        if (migrated) {
          clearGuestFavorites();
        }
      }

      hasMigratedGuestFavorites.current = true;
    }

    const ids = await fetchUserFavoriteIds(user.id);
    emitFavoriteSnapshot({
      userId: user.id,
      favoriteIds: ids,
      isLoading: false,
    });
  }, [supabase]);

  useEffect(() => {
    favoriteListeners.add(setSnapshot);
    setSnapshot(favoriteSnapshot);

    if (!hydrationPromise) {
      hydrationPromise = refreshFavorites().finally(() => {
        hydrationPromise = null;
      });
    }

    return () => {
      favoriteListeners.delete(setSnapshot);
    };
  }, [refreshFavorites]);

  useEffect(() => {
    if (authSubscriptionInitialized) {
      return;
    }

    authSubscriptionInitialized = true;
    supabase.auth.onAuthStateChange(() => {
      void refreshFavorites();
    });
  }, [refreshFavorites, supabase]);

  const requireLoginForSave = useCallback(() => {
    toast("Hisobga kirsangiz saqlanganlar barcha qurilmalarda sinxron bo'ladi", {
      icon: "ℹ️",
    });
  }, []);

  const isFavorite = useCallback(
    (listingId: string) => snapshot.favoriteIds.includes(listingId),
    [snapshot.favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!snapshot.userId) {
        const wasFavorite = favoriteSnapshot.favoriteIds.includes(listingId);
        const nextFavoriteIds = wasFavorite
          ? favoriteSnapshot.favoriteIds.filter((id) => id !== listingId)
          : [listingId, ...favoriteSnapshot.favoriteIds];

        setGuestFavoriteIds(nextFavoriteIds);
        emitFavoriteSnapshot({
          ...favoriteSnapshot,
          favoriteIds: nextFavoriteIds,
          isLoading: false,
        });

        toast.success(
          wasFavorite
            ? "Saqlanganlardan olib tashlandi"
            : "Saqlanganlarga qo'shildi"
        );
        requireLoginForSave();
        return true;
      }

      const previousSnapshot = favoriteSnapshot;
      const wasFavorite = previousSnapshot.favoriteIds.includes(listingId);
      const nextFavoriteIds = wasFavorite
        ? previousSnapshot.favoriteIds.filter((id) => id !== listingId)
        : [listingId, ...previousSnapshot.favoriteIds];

      emitFavoriteSnapshot({
        ...previousSnapshot,
        favoriteIds: nextFavoriteIds,
      });

      const success = wasFavorite
        ? await removeFavorite(snapshot.userId, listingId)
        : await addFavorite(snapshot.userId, listingId);

      if (!success) {
        emitFavoriteSnapshot(previousSnapshot);
        toast.error("Saqlanganlar holatini yangilab bo'lmadi");
        return false;
      }

      toast.success(
        wasFavorite ? "Saqlanganlardan olib tashlandi" : "Saqlanganlarga qo'shildi"
      );
      return true;
    },
    [requireLoginForSave, snapshot.userId]
  );

  return {
    favoriteIds: snapshot.favoriteIds,
    isFavorite,
    toggleFavorite,
    isLoading: snapshot.isLoading,
    userId: snapshot.userId,
    requireLoginForSave,
    refreshFavorites,
  };
}
