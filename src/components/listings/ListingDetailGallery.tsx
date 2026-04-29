"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, X } from "lucide-react";
import { useMemo, useState } from "react";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";
import { LISTING_IMAGE_BLUR_DATA_URL } from "@/lib/listingImages";

type ListingDetailGalleryProps = {
  images: string[];
  alt: string;
};

export default function ListingDetailGallery({ images, alt }: ListingDetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);

  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <ListingImageCarousel
          images={galleryImages}
          alt={alt}
          aspectClassName="h-[35vh] min-h-[300px]"
          autoPlay={galleryImages.length > 1}
          imageSizes="(max-width: 768px) 100vw, 768px"
          priority
          currentIndex={selectedIndex}
          onIndexChange={setSelectedIndex}
          onImageClick={(index) => {
            setSelectedIndex(index);
            setIsFullscreenOpen(true);
          }}
        />
        <button
          type="button"
          onClick={() => setIsFullscreenOpen(true)}
          className="absolute right-4 top-20 inline-flex items-center gap-2 rounded-full bg-slate-950/50 px-3 py-2 text-xs font-bold text-white backdrop-blur"
        >
          <Expand className="h-3.5 w-3.5" />
          Kattalashtirish
        </button>
      </div>

      {galleryImages.length > 1 ? (
        <div className="px-5 pt-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                  selectedIndex === index ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-slate-200"
                }`}
              >
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={LISTING_IMAGE_BLUR_DATA_URL}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {isFullscreenOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-full flex-col justify-center gap-4 px-4 pb-6 pt-16">
              <ListingImageCarousel
                images={galleryImages}
                alt={alt}
                aspectClassName="h-[60vh]"
                imageSizes="100vw"
                showDots={false}
                currentIndex={selectedIndex}
                onIndexChange={setSelectedIndex}
                onImageClick={(index) => setSelectedIndex(index)}
                className="rounded-[28px]"
              />
              {galleryImages.length > 1 ? (
                <div className="flex gap-3 overflow-x-auto px-1 pb-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-fullscreen-${index}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                        selectedIndex === index ? "border-white" : "border-white/20"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${alt} preview ${index + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={LISTING_IMAGE_BLUR_DATA_URL}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
