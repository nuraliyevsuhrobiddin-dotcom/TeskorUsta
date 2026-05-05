import { Star, MapPin, Briefcase, Phone, ShieldCheck, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/data/mockListings";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
  priority?: boolean;
}

function getTelegramHref(telegram?: string) {
  const value = telegram?.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const username = value.startsWith("@") ? value.slice(1) : value;
  return `https://t.me/${username}`;
}

function getPhoneHref(phone?: string) {
  const normalized = phone?.replace(/[^\d+]/g, "").trim();
  return normalized ? `tel:${normalized}` : null;
}

export default function ListingCard({ listing, featured = false, priority = false }: ListingCardProps) {
  const phoneHref = getPhoneHref(listing.phone);
  const telegramHref = getTelegramHref(listing.telegram);
  const contactHref = phoneHref || telegramHref || `/listings/${listing.slug}`;
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const saved = isFavorite(listing.id);

  return (
    <div 
      className="block interactive"
    >
      <Link href={`/listings/${listing.slug}`} className="block">
        <div 
          className={cn(
            "bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden border p-3 flex flex-col gap-3 transition-shadow",
            featured 
              ? "border-blue-100 dark:border-blue-900/30 shadow-[0_8px_30px_rgb(37,99,235,0.08)] bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900" 
              : "border-slate-100 dark:border-slate-800 shadow-premium dark:shadow-none"
          )}
        >
          {/* Image Section */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image 
              src={listing.imageUrl} 
              alt={listing.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {listing.isVip && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
                  <ShieldCheck className="w-3 h-3" />
                  VIP Usta
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void toggleFavorite(listing.id);
              }}
              disabled={isLoading}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-lg backdrop-blur-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={saved ? "Saqlanganlardan olib tashlash" : "Saqlanganlarga qo'shish"}
            >
              <Heart className={`h-4.5 w-4.5 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            {/* Bottom Badges */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg text-xs font-semibold shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {listing.rating} ({listing.reviewsCount})
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-1.5 px-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">{listing.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{listing.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-transparent dark:border-slate-800">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{listing.district}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-transparent dark:border-slate-800">
                <Briefcase className="w-3 h-3" />
                <span>{listing.experienceYears} yil tajriba</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Button */}
      <div className="mt-1 px-3 pb-3 -mt-[60px] relative z-10">
        <a
          href={contactHref}
          target={telegramHref && !phoneHref ? "_blank" : undefined}
          rel={telegramHref && !phoneHref ? "noopener noreferrer" : undefined}
          onClick={(event) => event.stopPropagation()}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-3 rounded-xl font-semibold text-sm transition-colors border border-slate-100 dark:border-slate-800"
        >
          <Phone className="w-4 h-4" />
          Bog&apos;lanish
        </a>
      </div>
    </div>
  );
}
