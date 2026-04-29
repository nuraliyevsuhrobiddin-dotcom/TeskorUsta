"use client";

import { use, useEffect, useState } from "react";
import { districts, categories, mockListings } from "@/data/mockListings";
import { UploadCloud, CheckCircle, X, Save, Eye, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchListingById, updateListing, uploadImage } from "@/lib/supabase/api";

export default function AdminEditListing({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const listingId = resolvedParams.id;
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: categories[0],
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchListingById(listingId).then(listing => {
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
        setCurrentImageUrl(listing.imageUrl);
      } else {
        toast.error("E'lon topilmadi!");
        router.push("/admin/listings");
      }
      setLoading(false);
    });
  }, [listingId, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }
    
    setIsSaving(true);
    let imageUrl = currentImageUrl;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const success = await updateListing(listingId, {
      ...formData,
      services,
      imageUrl
    });

    setIsSaving(false);

    if (success) {
      toast.success("O'zgarishlar muvaffaqiyatli saqlandi!");
      router.push("/admin/listings");
    } else {
      toast.error("Saqlashda xatolik yuz berdi");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">E'lonni tahrirlash</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {isSaving ? "Yangilanmoqda..." : "Yangilash"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Asosiy ma'lumotlar</h2>
            
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
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tuman *</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
                >
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tavsif</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium min-h-[120px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Xizmatlar ro'yxati</h2>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                placeholder="Xizmat nomini kiriting"
                value={newService}
                onChange={e => setNewService(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <button onClick={addService} type="button" className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">Qo'shish</button>
            </div>
            
            {services.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {services.map(service => (
                  <div key={service} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    {service}
                    <button onClick={() => removeService(service)} className="ml-1 text-blue-400 hover:text-rose-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Media</h2>
            <label className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              {(imageFile || currentImageUrl) ? (
                <img src={imageFile ? URL.createObjectURL(imageFile) : currentImageUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
              ) : null}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10 text-white">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold shadow-sm">Rasmni o'zgartirish</span>
              </div>
            </label>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Kontaktlar & Statistika</h2>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Telefon</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tajriba (yil)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Reyting</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Sozlamalar</h2>
            
            <label className="flex items-center justify-between cursor-pointer p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <span className="block text-sm font-bold text-slate-800">Aktiv e'lon</span>
                <span className="block text-xs text-slate-500 font-medium mt-0.5">Saytda ko'rinadi</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${formData.isActive ? 'bg-blue-500' : 'bg-slate-300'}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border border-amber-100 rounded-xl hover:bg-amber-50 bg-amber-50/30 transition-colors">
              <div>
                <span className="block text-sm font-bold text-amber-700 flex items-center gap-1.5">VIP E'lon</span>
                <span className="block text-xs text-amber-600/70 font-medium mt-0.5">Yuqori qatorda ko'rinadi</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${formData.isVip ? 'bg-amber-500' : 'bg-amber-200'}`} onClick={() => setFormData({...formData, isVip: !formData.isVip})}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.isVip ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
