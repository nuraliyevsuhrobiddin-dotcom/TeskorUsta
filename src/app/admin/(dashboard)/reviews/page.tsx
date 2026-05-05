"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Star, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AdminReview,
  AdminReviewStatus,
  deleteReview,
  fetchAdminReviews,
  updateReviewStatus,
} from "@/lib/supabase/api";

const statusLabels: Record<AdminReviewStatus, string> = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState<AdminReviewStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    setReviews(await fetchAdminReviews());
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(
    () => reviews.filter((review) => status === "all" || review.status === status),
    [reviews, status]
  );

  const handleStatus = async (id: string, nextStatus: AdminReviewStatus) => {
    const success = await updateReviewStatus(id, nextStatus);
    if (!success) {
      toast.error("Sharh holatini o'zgartirib bo'lmadi");
      return;
    }

    setReviews((current) =>
      current.map((review) => (review.id === id ? { ...review, status: nextStatus } : review))
    );
    toast.success("Sharh yangilandi");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Sharhni o'chirishni tasdiqlaysizmi?")) return;

    const success = await deleteReview(id);
    if (!success) {
      toast.error("Sharhni o'chirib bo'lmadi");
      return;
    }

    setReviews((current) => current.filter((review) => review.id !== id));
    toast.success("Sharh o'chirildi");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sharhlar</h1>
          <p className="text-sm text-slate-500">Mijoz fikrlarini tekshirish va moderatsiya qilish.</p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as AdminReviewStatus | "all")}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="all">Barcha sharhlar</option>
          <option value="pending">Kutilmoqda</option>
          <option value="approved">Tasdiqlangan</option>
          <option value="rejected">Rad etilgan</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-72 bg-slate-100 animate-pulse" />
        ) : filteredReviews.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">Sharh topilmadi</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800">{review.userName}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-current" /> {review.rating}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      {statusLabels[review.status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-6">{review.comment || "Izoh qoldirilmagan"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-400">
                    <span>{new Date(review.createdAt).toLocaleString("uz-UZ")}</span>
                    {review.listingSlug ? (
                      <Link className="text-blue-600 hover:text-blue-700" href={`/listings/${review.listingSlug}`}>
                        {review.listingName}
                      </Link>
                    ) : (
                      <span>{review.listingName}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatus(review.id, "approved")}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleStatus(review.id, "rejected")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
