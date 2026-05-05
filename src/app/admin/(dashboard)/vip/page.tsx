"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { fetchAdminListings, updateListingVip } from "@/lib/supabase/api";
import { Listing } from "@/data/mockListings";

export default function AdminVipPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<"all" | "vip" | "regular">("vip");
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    setListings(await fetchAdminListings());
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        if (filter === "vip") return listing.isVip;
        if (filter === "regular") return !listing.isVip;
        return true;
      }),
    [filter, listings]
  );

  const patchListing = (id: string, patch: Partial<Listing>) => {
    setListings((current) => current.map((listing) => (listing.id === id ? { ...listing, ...patch } : listing)));
  };

  const saveVip = async (listing: Listing) => {
    const success = await updateListingVip(listing.id, {
      isVip: listing.isVip,
      vipUntil: listing.vipUntil,
      vipPriority: listing.vipPriority ?? 0,
    });

    if (success) toast.success("VIP sozlamasi saqlandi");
    else toast.error("VIP sozlamasini saqlab bo'lmadi");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">VIP boshqaruv</h1>
          <p className="text-sm text-slate-500">VIP holati, muddati va ustuvorligini boshqarish.</p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as typeof filter)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="vip">Faqat VIP</option>
          <option value="regular">Oddiy</option>
          <option value="all">Barchasi</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-72 bg-slate-100 animate-pulse" />
        ) : filteredListings.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">E'lon topilmadi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">E'lon</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">VIP</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Muddat</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Priority</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500 text-right">Saqlash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100">
                          <img src={listing.imageUrl} alt={listing.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            {listing.name}
                            {listing.isVip ? <ShieldCheck className="h-4 w-4 text-amber-500" /> : null}
                          </p>
                          <p className="text-xs font-medium text-slate-500">{listing.category} - {listing.district}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-amber-500"
                        checked={listing.isVip}
                        onChange={(event) => patchListing(listing.id, { isVip: event.target.checked })}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="date"
                        value={listing.vipUntil ?? ""}
                        onChange={(event) => patchListing(listing.id, { vipUntil: event.target.value || null })}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min={0}
                        value={listing.vipPriority ?? 0}
                        onChange={(event) => patchListing(listing.id, { vipPriority: Number(event.target.value) || 0 })}
                        className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => saveVip(listing)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4" /> Saqlash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
