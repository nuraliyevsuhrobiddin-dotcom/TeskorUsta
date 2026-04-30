import { createClient } from "./client";
import { defaultCategories, Listing } from "@/data/mockListings";
import {
  buildListingImagePath,
  extractStoragePathFromPublicUrl,
  getListingImageUrls,
  LISTING_EMPTY_IMAGE,
  validateListingImageFile,
} from "@/lib/listingImages";

type ReviewRow = {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

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
  reviews?: ReviewRow[];
  is_active?: boolean | null;
  phone?: string | null;
  telegram?: string | null;
};

export type ListingWriteInput = {
  name: string;
  slug: string;
  category: string;
  district: string;
  phone: string;
  telegram?: string;
  experience: string | number;
  rating: string | number;
  description?: string;
  services: string[];
  imageUrl?: string;
  images?: string[];
  isVip: boolean;
  isActive: boolean;
};

export type DashboardStats = {
  totalListings: number;
  vipListings: number;
  totalViews: number;
  activeListings: number;
  latestUpdateLabel: string;
};

export type ListingImageUploadResult = {
  urls: string[];
  uploadedCount: number;
};

type FavoriteRow = {
  id: string;
  listing_id: string;
  listings: ListingRow | ListingRow[] | null;
};

type CategoryCacheEntry = {
  expiresAt: number;
  value: string[];
};

const ACTIVE_CATEGORY_CACHE_TTL_MS = 60_000;
let activeCategoryCache: CategoryCacheEntry | null = null;

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

const SLUG_CHAR_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "x", ц: "s", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "",
  э: "e", ю: "yu", я: "ya", қ: "q", ғ: "g", ҳ: "h", ў: "o", ә: "a",
};

function transliterateToSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[а-яёқғҳўә]/g, (char) => SLUG_CHAR_MAP[char] ?? "")
    .replace(/o['’`]/g, "o")
    .replace(/g['’`]/g, "g")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createSlugBase(name: string) {
  const slug = transliterateToSlug(name);
  if (slug) {
    return slug;
  }

  const fallbackSource = transliterateToSlug(`usta ${name}`) || "listing";
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${fallbackSource}-${randomSuffix}`;
}

async function slugExists(slug: string, excludeId?: string) {
  const supabase = createClient();
  let query = supabase.from("listings").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    console.error("Error checking slug uniqueness:", error);
    throw error;
  }

  return Boolean(data && data.length > 0);
}

function isMissingImagesColumnError(error: unknown) {
  const supabaseError = error as SupabaseErrorLike | null;
  const message = supabaseError?.message?.toLowerCase() ?? "";

  return (
    supabaseError?.code === "PGRST204" &&
    message.includes("images") &&
    message.includes("listings")
  );
}

function buildListingPayload(listingData: ListingWriteInput, options: { includeImages?: boolean } = {}) {
  const { includeImages = true } = options;
  const imageUrls = getListingImageUrls(listingData.images, listingData.imageUrl).filter(
    (url) => url !== LISTING_EMPTY_IMAGE
  );

  const payload = {
    name: listingData.name,
    slug: listingData.slug,
    category: listingData.category,
    district: listingData.district,
    phone: listingData.phone,
    telegram: listingData.telegram,
    experience_years: Number(listingData.experience) || 0,
    rating: Number(listingData.rating) || 5.0,
    description: listingData.description,
    services: listingData.services || [],
    image_url: imageUrls[0] ?? listingData.imageUrl ?? null,
    is_vip: listingData.isVip,
    is_active: listingData.isActive,
  };

  return includeImages ? { ...payload, images: imageUrls } : payload;
}

export async function fetchListings(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data.map((row) => mapListing(row as ListingRow));
}

export async function fetchAdminListings(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching admin listings:", error);
    return [];
  }

  return data.map((row) => mapListing(row as ListingRow));
}

export async function fetchAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("is_vip, is_active, views_count, updated_at");

  if (error || !data) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalListings: 0,
      vipListings: 0,
      totalViews: 0,
      activeListings: 0,
      latestUpdateLabel: "Ma'lumot yo'q",
    };
  }

  const totalListings = data.length;
  const vipListings = data.filter((row) => row.is_vip).length;
  const activeListings = data.filter((row) => row.is_active !== false).length;
  const totalViews = data.reduce(
    (sum, row) => sum + Number((row as { views_count?: number | null }).views_count ?? 0),
    0
  );
  const latestUpdatedAt = data.reduce<string | null>((latest, row) => {
    const current = (row as { updated_at?: string | null }).updated_at ?? null;
    if (!current) {
      return latest;
    }
    if (!latest) {
      return current;
    }
    return new Date(current).getTime() > new Date(latest).getTime() ? current : latest;
  }, null);

  return {
    totalListings,
    vipListings,
    totalViews,
    activeListings,
    latestUpdateLabel: latestUpdatedAt
      ? new Date(latestUpdatedAt).toLocaleString("uz-UZ", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Ma'lumot yo'q",
  };
}

export async function fetchCategories(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("category")
    .not("category", "is", null)
    .order("category", { ascending: true });

  if (error || !data) {
    console.error("Error fetching categories:", error);
    return defaultCategories;
  }

  const databaseCategories = data
    .map((row) => row.category?.trim())
    .filter((category): category is string => Boolean(category));

  const uniqueCategories = Array.from(new Set([...defaultCategories, ...databaseCategories]));

  return uniqueCategories;
}

export async function fetchActiveCategories(): Promise<string[]> {
  const now = Date.now();

  if (activeCategoryCache && activeCategoryCache.expiresAt > now) {
    return activeCategoryCache.value;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("category")
    .eq("is_active", true)
    .not("category", "is", null)
    .order("category", { ascending: true });

  if (error || !data) {
    console.error("Error fetching active categories:", error);
    return [];
  }

  const categories = Array.from(
    new Set(
      data
        .map((row) => row.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  ).sort((first, second) => first.localeCompare(second, "uz"));

  activeCategoryCache = {
    value: categories,
    expiresAt: now + ACTIVE_CATEGORY_CACHE_TTL_MS,
  };

  return categories;
}

export async function fetchValidFavoriteListings(
  favoriteIds: string[]
): Promise<{ listings: Listing[]; removedIds: string[] }> {
  const normalizedIds = Array.from(
    new Set(
      favoriteIds
        .map((favoriteId) => favoriteId.trim())
        .filter((favoriteId) => Boolean(favoriteId))
    )
  );

  if (normalizedIds.length === 0) {
    return { listings: [], removedIds: [] };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("id", normalizedIds)
    .eq("is_active", true);

  if (error || !data) {
    console.error("Error fetching saved listings:", error);
    return { listings: [], removedIds: normalizedIds };
  }

  const listings = data.map((row) => mapListing(row as ListingRow));
  const foundIds = new Set(listings.map((listing) => listing.id));
  const removedIds = normalizedIds.filter((favoriteId) => !foundIds.has(favoriteId));

  if (removedIds.length > 0) {
    console.warn("Broken saved records removed from favorites:", removedIds);
  }

  const orderedListings = normalizedIds
    .map((favoriteId) => listings.find((listing) => listing.id === favoriteId) ?? null)
    .filter((listing): listing is Listing => Boolean(listing));

  return {
    listings: orderedListings,
    removedIds,
  };
}

export async function fetchUserFavoriteIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching favorite IDs:", error);
    return [];
  }

  return data
    .map((row) => row.listing_id?.trim())
    .filter((listingId): listingId is string => Boolean(listingId));
}

export async function addFavorite(userId: string, listingId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    listing_id: listingId,
  });

  if (error) {
    console.error("Error adding favorite:", error);
    return false;
  }

  return true;
}

export async function removeFavorite(userId: string, listingId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);

  if (error) {
    console.error("Error removing favorite:", error);
    return false;
  }

  return true;
}

export async function migrateFavoriteIdsToSupabase(
  userId: string,
  listingIds: string[]
): Promise<boolean> {
  const normalizedIds = Array.from(
    new Set(listingIds.map((listingId) => listingId.trim()).filter((listingId) => Boolean(listingId)))
  );

  if (normalizedIds.length === 0) {
    return true;
  }

  const supabase = createClient();
  const payload = normalizedIds.map((listingId) => ({
    user_id: userId,
    listing_id: listingId,
  }));

  const { error } = await supabase.from("favorites").upsert(payload, {
    onConflict: "user_id,listing_id",
    ignoreDuplicates: true,
  });

  if (error) {
    console.error("Error migrating guest favorites:", error);
    return false;
  }

  return true;
}

export async function fetchUserFavoriteListings(userId: string): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("id, listing_id, listings(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching favorite listings:", error);
    return [];
  }

  const rows = data as FavoriteRow[];
  const validListings: Listing[] = [];

  rows.forEach((row) => {
    const rawListing = Array.isArray(row.listings) ? row.listings[0] ?? null : row.listings;

    if (!rawListing || rawListing.is_active === false) {
      console.warn("Broken saved record skipped:", row.listing_id);
      return;
    }

    validListings.push(mapListing(rawListing));
  });

  return validListings;
}

export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = createSlugBase(name);
  let candidate = baseSlug;
  let attempt = 1;

  while (await slugExists(candidate, excludeId)) {
    attempt += 1;
    const suffix = Math.random().toString(36).slice(2, 6 + Math.min(attempt, 4));
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

export function mapListing(row: ListingRow): Listing {
  const images = getListingImageUrls(row.images, row.image_url);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    district: row.district,
    rating: Number(row.rating ?? 0),
    experienceYears: row.experience_years ?? 0,
    imageUrl: images[0],
    images,
    isVip: row.is_vip ?? false,
    isActive: row.is_active ?? true,
    description: row.description || "",
    services: row.services || [],
    phone: row.phone || "",
    telegram: row.telegram || "",
    reviews: row.reviews
      ? row.reviews
          .map((review) => ({
            id: review.id,
            author: review.user_name,
            rating: review.rating,
            comment: review.comment,
            date: new Date(review.created_at).toLocaleDateString("uz-UZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : [],
    reviewsCount: row.reviews_count || 0,
  };
}

export async function fetchListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, reviews(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching listing:", error);
    return null;
  }

  return mapListing(data as ListingRow);
}

export async function deleteListing(id: string): Promise<boolean> {
  const supabase = createClient();
  const listing = await fetchListingById(id);
  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) {
    console.error("Error deleting listing:", error);
    return false;
  }

  if (listing?.images?.length) {
    await deleteImagesFromStorage(listing.images);
  }

  return true;
}

export async function toggleListingStatus(id: string, currentStatus: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .update({ is_active: !currentStatus })
    .eq("id", id);

  if (error) {
    console.error("Error toggling listing status:", error);
    return false;
  }
  return true;
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching listing by ID:", error);
    return null;
  }

  return mapListing(data as ListingRow);
}

export async function updateListing(id: string, listingData: ListingWriteInput): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .update(buildListingPayload(listingData))
    .eq("id", id);

  if (error) {
    if (isMissingImagesColumnError(error)) {
      console.warn("Listings table does not have an images column. Retrying update with image_url only.");
      const { error: fallbackError } = await supabase
        .from("listings")
        .update(buildListingPayload(listingData, { includeImages: false }))
        .eq("id", id);

      if (!fallbackError) {
        return true;
      }

      console.error("Error updating listing without images column:", fallbackError);
      return false;
    }

    console.error("Error updating listing:", error);
    return false;
  }
  return true;
}

export async function uploadListingImages(
  files: File[],
  onProgress?: (uploadedCount: number, totalCount: number) => void
): Promise<ListingImageUploadResult> {
  const supabase = createClient();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const validationError = validateListingImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const filePath = buildListingImagePath(file);
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error("Rasmni yuklashda xatolik yuz berdi");
    }

    const { data } = supabase.storage.from("listing-images").getPublicUrl(filePath);
    uploadedUrls.push(data.publicUrl);
    onProgress?.(uploadedUrls.length, files.length);
  }

  return {
    urls: uploadedUrls,
    uploadedCount: uploadedUrls.length,
  };
}

export async function deleteImagesFromStorage(urls: string[]) {
  const supabase = createClient();
  const paths = urls
    .map((url) => extractStoragePathFromPublicUrl(url))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return true;
  }

  const { error } = await supabase.storage.from("listing-images").remove(paths);

  if (error) {
    console.error("Error deleting images from storage:", error);
    return false;
  }

  return true;
}

export async function addListing(listingData: ListingWriteInput): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("listings").insert([buildListingPayload(listingData)]);

  if (error) {
    if (isMissingImagesColumnError(error)) {
      console.warn("Listings table does not have an images column. Retrying insert with image_url only.");
      const { error: fallbackError } = await supabase
        .from("listings")
        .insert([buildListingPayload(listingData, { includeImages: false })]);

      if (!fallbackError) {
        return true;
      }

      console.error("Error adding listing without images column:", fallbackError);
      return false;
    }

    console.error("Error adding listing:", error);
    return false;
  }
  return true;
}

export async function addReviewToListing(
  listingId: string,
  review: { name: string; rating: number; comment: string }
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("reviews").insert([
    {
      listing_id: listingId,
      user_name: review.name,
      rating: review.rating,
      comment: review.comment,
    },
  ]);

  if (error) {
    console.error("Error adding review:", error);
    return false;
  }
  return true;
}
