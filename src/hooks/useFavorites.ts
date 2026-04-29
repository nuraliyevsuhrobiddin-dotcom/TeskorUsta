import { useState, useEffect } from "react";
import { Listing } from "@/data/mockListings";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Listing[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tezkorusta_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const toggleFavorite = (listing: Listing) => {
    setFavorites(prev => {
      const isFav = prev.some(l => l.id === listing.id);
      let nextFavs;
      if (isFav) {
        nextFavs = prev.filter(l => l.id !== listing.id);
      } else {
        nextFavs = [...prev, listing];
      }
      localStorage.setItem("tezkorusta_favorites", JSON.stringify(nextFavs));
      return nextFavs;
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some(l => l.id === id);
  };

  return { favorites, toggleFavorite, isFavorite };
}
