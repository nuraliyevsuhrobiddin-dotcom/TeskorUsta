import { createClient } from "./client";
import { Listing } from "@/data/mockListings";

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

export function mapListing(row: any): Listing {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    district: row.district,
    rating: Number(row.rating),
    experienceYears: row.experience_years,
    imageUrl: row.image_url || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    isVip: row.is_vip,
    isActive: row.is_active,
    description: row.description,
    services: row.services || [],
    reviews: row.reviews ? row.reviews.map((r: any) => ({
      id: r.id,
      author: r.user_name,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
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
export async function fetchListingById(id: string): Promise<any | null> {
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

export async function updateListing(id: string, listingData: any): Promise<boolean> {
  const supabase = createClient();
  const updatePayload: any = {
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

export async function addListing(listingData: any): Promise<boolean> {
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
