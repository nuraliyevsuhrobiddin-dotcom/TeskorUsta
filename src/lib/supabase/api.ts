import { createClient } from "./client";
import { defaultCategories, Listing } from "@/data/mockListings";

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
  description: string | null;
  services: string[] | null;
  reviews?: ReviewRow[];
  is_active?: boolean | null;
  phone?: string | null;
  telegram?: string | null;
};

type ListingWriteInput = {
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
  isVip: boolean;
  isActive: boolean;
};

type DashboardStats = {
  totalListings: number;
  vipListings: number;
  totalViews: number;
  activeListings: number;
  latestUpdateLabel: string;
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
    .replace(/sh/g, "sh")
    .replace(/ch/g, "ch")
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

  return data.map(mapListing);
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

  return data.map(mapListing);
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

  const uniqueCategories = Array.from(
    new Set(
      data
        .map((row) => row.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  );

  return uniqueCategories.length > 0 ? uniqueCategories : defaultCategories;
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
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    district: row.district,
    rating: Number(row.rating ?? 0),
    experienceYears: row.experience_years ?? 0,
    imageUrl: row.image_url || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    isVip: row.is_vip ?? false,
    isActive: row.is_active ?? true,
    description: row.description || "",
    services: row.services || [],
    phone: row.phone || "",
    telegram: row.telegram || "",
    reviews: row.reviews ? row.reviews.map((r) => ({
      id: r.id,
      author: r.user_name,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
    reviewsCount: row.reviews_count || 0
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

  return mapListing(data);
}
export async function deleteListing(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting listing:", error);
    return false;
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

  return mapListing(data);
}

export async function updateListing(id: string, listingData: ListingWriteInput): Promise<boolean> {
  const supabase = createClient();
  const updatePayload: Record<string, unknown> = {
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
    is_vip: listingData.isVip,
    is_active: listingData.isActive,
  };

  if (listingData.imageUrl) {
    updatePayload.image_url = listingData.imageUrl;
  }

  const { error } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", id);
    
  if (error) {
    console.error("Error updating listing:", error);
    return false;
  }
  return true;
}
export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('listing-images')
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const { data } = supabase.storage
    .from('listing-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function addListing(listingData: ListingWriteInput): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .insert([
      {
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
        image_url: listingData.imageUrl,
        is_vip: listingData.isVip,
        is_active: listingData.isActive,
      }
    ]);
    
  if (error) {
    console.error("Error adding listing:", error);
    return false;
  }
  return true;
}

export async function addReviewToListing(listingId: string, review: { name: string, rating: number, comment: string }): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("reviews")
    .insert([
      {
        listing_id: listingId,
        user_name: review.name,
        rating: review.rating,
        comment: review.comment
      }
    ]);
    
  if (error) {
    console.error("Error adding review:", error);
    return false;
  }
  return true;
}
