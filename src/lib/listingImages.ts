const STORAGE_BUCKET = "listing-images";
const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const LISTING_EMPTY_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#dbeafe" />
          <stop offset="100%" stop-color="#eff6ff" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)" />
      <g fill="none" stroke="#93c5fd" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
        <rect x="180" y="170" width="840" height="460" rx="38" />
        <path d="M310 520l150-150 130 130 180-210 120 120" />
        <circle cx="430" cy="310" r="42" fill="#bfdbfe" stroke="none" />
      </g>
    </svg>
  `);

export const LISTING_IMAGE_BLUR_DATA_URL =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10">
      <defs>
        <linearGradient id="b" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#dbeafe" />
          <stop offset="100%" stop-color="#f8fafc" />
        </linearGradient>
      </defs>
      <rect width="16" height="10" fill="url(#b)" />
    </svg>
  `);

export type ListingImageItem = {
  id: string;
  url: string;
  kind: "existing" | "new";
  file?: File;
};

export function getListingImageUrls(images?: string[] | null, imageUrl?: string | null): string[] {
  const normalized = (images ?? [])
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (normalized.length > 0) {
    return normalized.slice(0, MAX_IMAGE_COUNT);
  }

  if (imageUrl?.trim()) {
    return [imageUrl.trim()];
  }

  return [LISTING_EMPTY_IMAGE];
}

export function isListingStorageUrl(url: string) {
  return url.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
}

export function extractStoragePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const startIndex = url.indexOf(marker);
  if (startIndex === -1) {
    return null;
  }

  const path = url.slice(startIndex + marker.length).split("?")[0];
  return path || null;
}

export function validateListingImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Faqat JPG, PNG yoki WEBP rasm yuklash mumkin";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Har bir rasm 5MB dan oshmasligi kerak";
  }

  return null;
}

export function buildListingImagePath(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension === "jpeg" ? "jpg" : extension;
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `listings/${randomId}.${safeExtension}`;
}

export function makeNewListingImageItem(file: File): ListingImageItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    url: URL.createObjectURL(file),
    kind: "new",
    file,
  };
}

export function makeExistingListingImageItem(url: string, index: number): ListingImageItem {
  return {
    id: `existing-${index}-${url}`,
    url,
    kind: "existing",
  };
}

export function revokeListingImagePreviews(items: ListingImageItem[]) {
  items.forEach((item) => {
    if (item.kind === "new" && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
}

export function clampListingImages(items: ListingImageItem[]) {
  return items.slice(0, MAX_IMAGE_COUNT);
}

export function canAddMoreListingImages(items: ListingImageItem[]) {
  return items.length < MAX_IMAGE_COUNT;
}

export const LISTING_IMAGE_LIMIT = MAX_IMAGE_COUNT;
