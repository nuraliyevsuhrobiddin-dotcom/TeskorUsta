type ListingFormInput = {
  name: string;
  slug: string;
  category: string;
  district: string;
  phone: string;
  telegram?: string;
  experience: string;
  rating: string;
  description: string;
  services: string[];
};

const PHONE_REGEX = /^\+?\d[\d\s()-]{8,}$/;
const TELEGRAM_REGEX = /^(@[A-Za-z0-9_]{5,32}|https?:\/\/t\.me\/[A-Za-z0-9_]{5,32})$/i;

export function validateListingForm(input: ListingFormInput): string | null {
  if (!input.name.trim()) return "Usta ismini kiriting";
  if (input.name.trim().length < 2) return "Usta ismi juda qisqa";
  if (!input.slug.trim()) return "Slug yaratilmadi";
  if (!input.category.trim()) return "Kategoriya tanlang";
  if (!input.district.trim()) return "Tuman tanlang";
  if (!PHONE_REGEX.test(input.phone.trim())) return "Telefon raqami noto'g'ri";

  if (input.telegram?.trim() && !TELEGRAM_REGEX.test(input.telegram.trim())) {
    return "Telegram username yoki havola noto'g'ri";
  }

  if (input.experience.trim()) {
    const experience = Number(input.experience);
    if (!Number.isFinite(experience) || experience < 0 || experience > 80) {
      return "Tajriba yili noto'g'ri";
    }
  }

  const rating = Number(input.rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return "Reyting 0 va 5 oralig'ida bo'lishi kerak";
  }

  if (input.description.trim().length > 0 && input.description.trim().length < 10) {
    return "Tavsif kamida 10 ta belgidan iborat bo'lsin";
  }

  if (input.services.length === 0) {
    return "Kamida bitta xizmat qo'shing";
  }

  return null;
}
