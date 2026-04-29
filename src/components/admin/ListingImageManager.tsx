"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  canAddMoreListingImages,
  clampListingImages,
  LISTING_EMPTY_IMAGE,
  LISTING_IMAGE_BLUR_DATA_URL,
  LISTING_IMAGE_LIMIT,
  ListingImageItem,
  makeNewListingImageItem,
  validateListingImageFile,
} from "@/lib/listingImages";

type ListingImageManagerProps = {
  items: ListingImageItem[];
  uploadLabel?: string;
  isUploading?: boolean;
  uploadProgressLabel?: string | null;
  onChange: (items: ListingImageItem[]) => void;
};

export default function ListingImageManager({
  items,
  uploadLabel = "Rasmlarni yuklash",
  isUploading = false,
  uploadProgressLabel,
  onChange,
}: ListingImageManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const canUploadMore = canAddMoreListingImages(items);
  const primaryImage = items[0]?.url ?? LISTING_EMPTY_IMAGE;
  const remainingSlots = LISTING_IMAGE_LIMIT - items.length;

  const imageCountLabel = useMemo(() => `${items.length}/${LISTING_IMAGE_LIMIT} rasm`, [items.length]);

  const mergeFiles = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      toast.error(`Yana faqat ${remainingSlots} ta rasm qo'shishingiz mumkin`);
      return;
    }

    const nextItems = [...items];

    for (const file of selectedFiles) {
      const error = validateListingImageFile(file);
      if (error) {
        toast.error(error);
        continue;
      }

      nextItems.push(makeNewListingImageItem(file));
    }

    onChange(clampListingImages(nextItems));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      mergeFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleRemove = (id: string) => {
    if (!window.confirm("Ushbu rasmni olib tashlamoqchimisiz?")) {
      return;
    }

    onChange(items.filter((item) => item.id !== id));
    toast.success("Rasm ro'yxatdan olib tashlandi");
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    const currentIndex = items.findIndex((item) => item.id === id);
    const nextIndex = currentIndex + direction;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= items.length) {
      return;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(currentIndex, 1);
    nextItems.splice(nextIndex, 0, movedItem);
    onChange(nextItems);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId?: string) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files?.length) {
      mergeFiles(files);
      return;
    }

    if (!draggedId || !targetId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const sourceIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, movedItem);
    onChange(nextItems);
    setDraggedId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => handleDrop(event)}
        className={`relative overflow-hidden rounded-[28px] border transition-all ${
          isDragOver
            ? "border-blue-400 bg-blue-50 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.5)]"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={primaryImage}
            alt="Asosiy rasm"
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-cover"
            placeholder="blur"
            blurDataURL={LISTING_IMAGE_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{uploadLabel}</p>
                <p className="text-xs text-white/80">JPG, PNG, WEBP. Har biri 5MB gacha.</p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={!canUploadMore || isUploading}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                Qo&apos;shish
              </button>
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={!canUploadMore || isUploading}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UploadCloud className="h-4 w-4 text-blue-500" />
          <span>{imageCountLabel}</span>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {uploadProgressLabel ?? `${remainingSlots} ta joy qoldi`}
        </span>
      </div>

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-600"
        >
          <div className="rounded-full bg-slate-100 p-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <span className="text-sm font-bold">5 tagacha rasm yuklang</span>
          <span className="text-xs font-medium text-slate-400">Drag & drop yoki tugma orqali tanlang</span>
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, item.id)}
              className="group overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.url}
                  alt={`Listing image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  placeholder="blur"
                  blurDataURL={LISTING_IMAGE_BLUR_DATA_URL}
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/65 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                    <GripVertical className="h-3 w-3" />
                    {index === 0 ? "Asosiy" : `${index + 1}-rasm`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="rounded-full bg-white/90 p-2 text-rose-500 shadow-sm transition hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="text-xs font-medium text-slate-500">
                  {item.kind === "new" ? "Yangi yuklanadi" : "Saqlangan rasm"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, -1)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, 1)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
