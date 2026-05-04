import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { districts, defaultCategories, type Listing } from "@/data/mockListings";
import { LISTING_EMPTY_IMAGE, getListingImageUrls } from "@/lib/listingImages";

type ListingRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  district: string;
  rating: number | string | null;
  reviews_count: number | null;
  experience_years: number | null;
  is_vip: boolean | null;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
  services: string[] | null;
  is_active?: boolean | null;
  phone?: string | null;
  telegram?: string | null;
};

const SITE_URL = "https://www.teskorusta24.uz";
const KNOWN_CATEGORIES = defaultCategories;
const KNOWN_DISTRICTS = districts;

export function getSiteUrl() {
  return SITE_URL;
}

export function slugifySeoSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/g['`\u2019\u02bb]/g, "g")
    .replace(/o['`\u2019\u02bb]/g, "o")
    .replace(/\u02bb/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function resolveKnownValue(slug: string, values: string[]) {
  return values.find((value) => slugifySeoSegment(value) === slug) ?? null;
}

export function resolveSeoParams(categorySlug: string, districtSlug: string) {
  const category = resolveKnownValue(categorySlug, KNOWN_CATEGORIES);
  const district = resolveKnownValue(districtSlug, KNOWN_DISTRICTS);

  if (!category || !district) {
    return null;
  }

  return { category, district };
}

export function getSeoLandingPath(category: string, district: string) {
  return `/${slugifySeoSegment(category)}/${slugifySeoSegment(district)}`;
}

export function getAllSeoLandingPairs() {
  return KNOWN_CATEGORIES.flatMap((category) =>
    KNOWN_DISTRICTS.map((district) => ({
      category,
      district,
      categorySlug: slugifySeoSegment(category),
      districtSlug: slugifySeoSegment(district),
    }))
  );
}

function mapListing(row: ListingRow): Listing {
  const images = getListingImageUrls(row.images, row.image_url);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    district: row.district,
    rating: Number(row.rating ?? 0),
    reviewsCount: row.reviews_count || 0,
    experienceYears: row.experience_years ?? 0,
    isVip: row.is_vip ?? false,
    isActive: row.is_active ?? true,
    imageUrl: images[0] ?? LISTING_EMPTY_IMAGE,
    images,
    description: row.description || "",
    services: row.services || [],
    phone: row.phone || "",
    telegram: row.telegram || "",
    reviews: [],
  };
}

export async function fetchSeoLandingListings(category: string, district: string): Promise<Listing[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id, slug, name, category, district, rating, reviews_count, experience_years, is_vip, image_url, description, services, is_active, phone, telegram"
      )
      .eq("is_active", true)
      .eq("category", category)
      .eq("district", district)
      .order("is_vip", { ascending: false })
      .order("rating", { ascending: false })
      .order("reviews_count", { ascending: false });

    if (error || !data) {
      console.error("Error fetching SEO landing listings:", error);
      return [];
    }

    return data.map((row) => mapListing(row as ListingRow));
  } catch (error) {
    console.error("Error fetching SEO landing listings:", error);
    return [];
  }
}
