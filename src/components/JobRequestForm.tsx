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

type FormErrors = Partial<Record<keyof typeof initialForm, string>>;

function validateForm(form: typeof initialForm) {
  const errors: FormErrors = {};

  if (!form.category.trim()) {
    errors.category = "Kategoriya tanlang";
  }

  if (!form.district.trim()) {
    errors.district = "Tumanni tanlang";
  }

  if (!form.description.trim()) {
    errors.description = "Ish haqida qisqacha yozing";
  }

  if (!form.phone.trim()) {
    errors.phone = "Telefon raqamni kiriting";
  }

  return errors;
}

export default function JobRequestForm({ open, onClose }: JobRequestFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateField = (field: keyof typeof initialForm) => {
    const nextErrors = validateForm(form);
    setErrors((current) => {
      const next = { ...current };
      if (nextErrors[field]) {
        next[field] = nextErrors[field];
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      toast.error(firstError);
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
      setErrors({});
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
            onClick={handleClose}
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
              onChange={(event) => updateField("category", event.target.value)}
              onBlur={() => validateField("category")}
              aria-invalid={Boolean(errors.category)}
              className={`rounded-xl border bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 outline-none focus:ring-2 ${
                errors.category
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-amber-400 focus:border-amber-500 focus:ring-amber-200"
              }`}
            >
              {defaultCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category ? <span className="text-xs font-semibold text-rose-600">{errors.category}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Tuman</span>
            <select
              value={form.district}
              onChange={(event) => updateField("district", event.target.value)}
              onBlur={() => validateField("district")}
              aria-invalid={Boolean(errors.district)}
              className={`rounded-xl border bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 ${
                errors.district
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            >
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.district ? <span className="text-xs font-semibold text-rose-600">{errors.district}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Ish tavsifi</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              onBlur={() => validateField("description")}
              placeholder="Masalan: oshxonada suv oqyapti..."
              aria-invalid={Boolean(errors.description)}
              className={`min-h-28 rounded-xl border bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 ${
                errors.description
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.description ? <span className="text-xs font-semibold text-rose-600">{errors.description}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700">Telefon</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              onBlur={() => validateField("phone")}
              placeholder="+998 90 123 45 67"
              aria-invalid={Boolean(errors.phone)}
              className={`rounded-xl border bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 ${
                errors.phone
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.phone ? <span className="text-xs font-semibold text-rose-600">{errors.phone}</span> : null}
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
