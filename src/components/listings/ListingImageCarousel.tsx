"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LISTING_IMAGE_BLUR_DATA_URL } from "@/lib/listingImages";

type ListingImageCarouselProps = {
  images: string[];
  alt: string;
  aspectClassName?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  imageSizes?: string;
  className?: string;
  showDots?: boolean;
  priority?: boolean;
  onImageClick?: (index: number) => void;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
};

export default function ListingImageCarousel({
  images,
  alt,
  aspectClassName = "aspect-[4/3]",
  autoPlay = false,
  intervalMs = 3000,
  imageSizes = "100vw",
  className = "",
  showDots = true,
  priority = false,
  onImageClick,
  currentIndex: controlledIndex,
  onIndexChange,
}: ListingImageCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const hasMultiple = images.length > 1;
  const mountedRef = useRef(true);
  const currentIndex = controlledIndex ?? internalIndex;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const nextIndex = Math.min(currentIndex, images.length - 1);
    if (controlledIndex === undefined) {
      setInternalIndex(nextIndex);
    } else if (nextIndex !== controlledIndex) {
      onIndexChange?.(nextIndex);
    }
  }, [controlledIndex, currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    if (!autoPlay || !hasMultiple || isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (!mountedRef.current) {
        return;
      }
      const nextIndex = (currentIndex + 1) % images.length;
      if (controlledIndex === undefined) {
        setInternalIndex(nextIndex);
      }
      onIndexChange?.(nextIndex);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [autoPlay, controlledIndex, currentIndex, hasMultiple, images.length, intervalMs, isPaused, onIndexChange]);

  const goTo = (index: number) => {
    if (!hasMultiple) {
      return;
    }
    const nextIndex = (index + images.length) % images.length;
    if (controlledIndex === undefined) {
      setInternalIndex(nextIndex);
    }
    onIndexChange?.(nextIndex);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || !hasMultiple) {
      setTouchStartX(null);
      setTouchDelta(0);
      return;
    }

    if (touchDelta > 45) {
      goTo(currentIndex - 1);
    } else if (touchDelta < -45) {
      goTo(currentIndex + 1);
    }

    setTouchStartX(null);
    setTouchDelta(0);
  };

  return (
    <div
      className={`relative overflow-hidden ${aspectClassName} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchMove={(event) => {
        if (touchStartX === null) {
          return;
        }
        setTouchDelta((event.touches[0]?.clientX ?? 0) - touchStartX);
      }}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.button
          key={images[currentIndex]}
          type="button"
          initial={{ opacity: 0.55, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.4, scale: 0.985 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={() => onImageClick?.(currentIndex)}
          className="absolute inset-0 block h-full w-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            sizes={imageSizes}
            className="object-cover"
            placeholder="blur"
            blurDataURL={LISTING_IMAGE_BLUR_DATA_URL}
            priority={priority}
          />
        </motion.button>
      </AnimatePresence>

      {hasMultiple ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />

          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-lg transition hover:bg-white md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-lg transition hover:bg-white md:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {showDots ? (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={`${images[index]}-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentIndex ? "w-6 bg-white" : "w-2.5 bg-white/50"
                  }`}
                  aria-label={`${index + 1}-rasmga o'tish`}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
