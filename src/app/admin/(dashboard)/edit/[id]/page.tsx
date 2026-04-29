"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { districts, defaultCategories } from "@/data/mockListings";
import { CheckCircle, ChevronLeft, Save, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteImagesFromStorage,
  fetchCategories,
  fetchListingById,
  generateUniqueSlug,
  updateListing,
  uploadListingImages,
} from "@/lib/supabase/api";
import { validateListingForm } from "@/lib/listingForm";
import ListingImageManager from "@/components/admin/ListingImageManager";
import {
  LISTING_IMAGE_LIMIT,
  ListingImageItem,
  makeExistingListingImageItem,
  revokeListingImagePreviews,
} from "@/lib/listingImages";

export default function AdminEditListing({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const listingId = resolvedParams.id;
  const slugRequestId = useRef(0);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: defaultCategories[0],
    district: districts[0],
    phone: "",
    telegram: "",
    experience: "",
    rating: "5.0",
    description: "",
    isVip: false,
    isActive: true,
  });

  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [imageItems, setImageItems] = useState<ListingImageItem[]>([]);
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);
  const [uploadProgressLabel, setUploadProgressLabel] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    return () => revokeListingImagePreviews(imageItems);
  }, [imageItems]);

  useEffect(() => {
    fetchListingById(listingId).then((listing) => {
      if (listing) {
        setFormData({
          name: listing.name,
          slug: listing.slug,
          category: listing.category,
          district: listing.district,
          phone: listing.phone || "",
          telegram: listing.telegram || "",
          experience: String(listing.experienceYears),
          rating: String(listing.rating),
          description: listing.description || "",
          isVip: listing.isVip,
          isActive: listing.isActive !== false,
        });
        setServices(listing.services || []);
        setInitialImageUrls(listing.images);
        setImageItems(listing.images.map((url, index) => makeExistingListingImageItem(url, index)));
      } else {
        toast.error("E'lon topilmadi");
        router.push("/admin/listings");
      }
      setLoading(false);
    });
  }, [listingId, router]);

  const imageCounterLabel = useMemo(
    () => `${imageItems.length}/${LISTING_IMAGE_LIMIT} premium preview`,
    [imageItems.length]
  );

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const requestId = ++slugRequestId.current;
    setFormData((current) => ({ ...current, name }));

    if (!name.trim()) {
      setFormData((current) => ({ ...current, slug: "" }));
      return;
    }

    try {
      const slug = await generateUniqueSlug(name, listingId);
      if (slugRequestId.current === requestId) {
        setFormData((current) => ({ ...current, slug }));
      }
    } catch {
      if (slugRequestId.current === requestId) {
        setFormData((current) => ({ ...current, slug: "" }));
      }
      toast.error("Slug yaratishda xatolik yuz berdi");
    }
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter((item) => item !== service));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateListingForm({
      ...formData,
      services,
      imageCount: imageItems.length,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    setUploadProgressLabel(null);

    try {
      const finalSlug = await generateUniqueSlug(formData.name, listingId);
      const uploadFiles = imageItems
        .filter((item) => item.kind === "new" && item.file)
        .map((item) => item.file as File);

      const uploadedUrls = uploadFiles.length
        ? (
            await uploadListingImages(uploadFiles, (uploadedCount, totalCount) => {
              setUploadProgressLabel(`${uploadedCount}/${totalCount} rasm yuklandi`);
            })
          ).urls
        : [];

      let uploadIndex = 0;
      const orderedUrls = imageItems.map((item) => {
        if (item.kind === "existing") {
          return item.url;
        }

        const nextUrl = uploadedUrls[uploadIndex];
        uploadIndex += 1;
        return nextUrl;
      });

      const success = await updateListing(listingId, {
        ...formData,
        slug: finalSlug,
        services,
        images: orderedUrls,
        imageUrl: orderedUrls[0],
      });

      if (!success) {
        toast.error("Saqlashda xatolik yuz berdi");
        return;
      }

      const removedUrls = initialImageUrls.filter((url) => !orderedUrls.includes(url));
      if (removedUrls.length > 0) {
        await deleteImagesFromStorage(removedUrls);
      }

      toast.success("E'lon va media yangilandi");
      router.push("/admin/listings");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rasmlarni yangilashda xatolik yuz berdi";
      toast.error(message);
    } finally {
      setIsSaving(false);
      setUploadProgressLabel(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/listings"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">E&apos;lonni tahrirlash</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Yangilanmoqda..." : "Yangilash"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Asosiy ma&apos;lumotlar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Usta ismi *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Slug (Avtomatik)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-medium"
                  value={formData.slug}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Kasbi *</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tuman *</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tavsif</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Xizmatlar ro&apos;yxati</h2>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                placeholder="Xizmat nomini kiriting"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              />
              <button
                onClick={addService}
                type="button"
                className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700"
              >
                Qo&apos;shish
              </button>
            </div>

            {services.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    {service}
                    <button
                      onClick={() => removeService(service)}
                      className="ml-1 text-blue-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Media</h2>
                <p className="text-sm text-slate-500 font-medium">{imageCounterLabel}</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
                Multi Image
              </div>
            </div>
            <ListingImageManager
              items={imageItems}
              isUploading={isSaving}
              uploadProgressLabel={uploadProgressLabel}
              onChange={setImageItems}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Kontaktlar & Statistika</h2>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Telefon</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Telegram (Username yoki Ssilka)</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tajriba (yil)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Reyting</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Sozlamalar</h2>

            <label className="flex items-center justify-between cursor-pointer p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <span className="block text-sm font-bold text-slate-800">Aktiv e&apos;lon</span>
                <span className="block text-xs text-slate-500 font-medium mt-0.5">Saytda ko&apos;rinadi</span>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  formData.isActive ? "bg-blue-500" : "bg-slate-300"
                }`}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border border-amber-100 rounded-xl hover:bg-amber-50 bg-amber-50/30 transition-colors">
              <div>
                <span className="block text-sm font-bold text-amber-700">VIP E&apos;lon</span>
                <span className="block text-xs text-amber-600/70 font-medium mt-0.5">
                  Yuqori qatorda ko&apos;rinadi
                </span>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  formData.isVip ? "bg-amber-500" : "bg-amber-200"
                }`}
                onClick={() => setFormData({ ...formData, isVip: !formData.isVip })}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.isVip ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
