"use client";

import { useEffect, useState } from "react";
import { districts, Listing } from "@/data/mockListings";
import { Search, Filter, MoreVertical, Edit, Trash2, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchAdminListings, deleteListing, toggleListingStatus } from "@/lib/supabase/api";

export default function AdminListingsPage() {
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [vipFilter, setVipFilter] = useState("all"); // 'all', 'vip', 'regular'
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    const data = await fetchAdminListings();
    setListings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = districtFilter === "all" || l.district === districtFilter;
    const matchesVip = vipFilter === "all" || (vipFilter === "vip" ? l.isVip : !l.isVip);
    return matchesSearch && matchesDistrict && matchesVip;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Rostdan ham bu e'lonni o'chirmoqchimisiz?")) {
      const success = await deleteListing(id);
      if (success) {
        setListings(prev => prev.filter(l => l.id !== id));
        toast.success("E'lon o'chirildi");
      } else {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const success = await toggleListingStatus(id, currentStatus);
    if (success) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !currentStatus } : l));
      toast.success("Status o'zgartirildi");
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">E'lonlar</h1>
        <Link 
          href="/admin/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all"
        >
          + Yangi e'lon
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ism yoki kasb bo'yicha qidirish..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="all">Barcha tumanlar</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
          >
            <option value="all">Barcha turdagi</option>
            <option value="vip">Faqat VIP</option>
            <option value="regular">Oddiy</option>
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usta</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tuman</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reyting</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Holati</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredListings.length > 0 ? filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative flex-shrink-0">
                        <img src={listing.imageUrl} alt={listing.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          {listing.name}
                          {listing.isVip && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{listing.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{listing.district}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md w-fit text-xs font-bold">
                      <span className="text-amber-500">★</span> {listing.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(listing.id, listing.isActive ?? true)}
                      className={listing.isActive !== false 
                        ? "flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors"
                        : "flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold hover:bg-slate-100 transition-colors"}
                    >
                      {listing.isActive !== false ? <><CheckCircle className="w-3.5 h-3.5" /> Aktiv</> : <><XCircle className="w-3.5 h-3.5" /> Nofaol</>}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/edit/${listing.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Hech narsa topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">Jami: <span className="font-bold text-slate-800">{filteredListings.length}</span> ta e'lon</p>
          <div className="flex gap-2">
            <button onClick={() => toast.error("Boshqa sahifa yo'q")} className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors">Oldingi</button>
            <button onClick={() => toast.success("Keyingi sahifa yuklanmoqda...", {icon: "🔄"})} className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors">Keyingi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
