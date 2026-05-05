"use client";

import { FormEvent, useState } from "react";
import { Camera, Send, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { defaultCategories, districts } from "@/data/mockListings";
import { createJobRequest } from "@/lib/supabase/api";
import { trackEvent } from "@/lib/analytics";

type JobRequestFormProps = {
  open: boolean;
  onClose: () => void;
};

const initialForm = {
  category: defaultCategories[0],
  district: districts[0],
  description: "",
  phone: "",
};

export default function JobRequestForm({ open, onClose }: JobRequestFormProps) {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.phone.trim()) {
      toast.error("Telefon raqamni kiriting");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Ish haqida qisqacha yozing");
      return;
    }

    setSubmitting(true);

    try {
      const success = await createJobRequest({
        ...form,
        image,
      });

      if (!success) {
        toast.error("So'rov yuborilmadi");
        return;
      }

      toast.success("Rahmat! Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.");
      void trackEvent("job_request_created", {
        category: form.category,
        district: form.district,
      });
      setForm(initialForm);
      setImage(null);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "So'rov yuborishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      {!open ? null : (
    <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/60 px-3 py-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Usta chaqirish</h2>
            <p className="text-sm font-medium text-slate-500">Muammoni yozing, admin siz bilan bog'lanadi.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Kategoriya</span>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              {defaultCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Tuman</span>
            <select
              value={form.district}
              onChange={(event) => setForm({ ...form, district: event.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
            >
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Ish tavsifi</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Masalan: oshxonada suv oqyapti..."
              className="min-h-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Telefon</span>
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="+998 90 123 45 67"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50">
            <span className="inline-flex min-w-0 items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" />
              <span className="truncate">{image ? image.name : "Rasm yuklash ixtiyoriy"}</span>
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </form>
      </div>
    </div>
      )}
    </>
  );
}
