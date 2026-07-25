"use client";

import { useState } from "react";
import { CarFront, ChevronLeft, ChevronRight } from "lucide-react";

interface CarGalleryProps {
  images: string[];
  title: string;
}

export function CarGallery({ images, title }: CarGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (images.length < 2) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length < 2) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const mainImage = images[currentIndex] ?? images[0] ?? null;
  const thumbnails = images.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative h-85 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm group sm:h-105">
        {mainImage ? (
          // Storage hostnames vary by environment and are not known at build time.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.01]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <CarFront className="size-20" aria-hidden="true" />
            <span className="text-sm">Image unavailable</span>
          </div>
        )}

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-card/80 dark:hover:bg-card"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-card/80 dark:hover:bg-card"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-3 gap-4">
        {thumbnails.slice(1, 4).map((imgUrl, idx) => {
          const actualIndex = idx + 1;
          const isActive = currentIndex === actualIndex;
          return (
            <button
              key={actualIndex}
              type="button"
              onClick={() => setCurrentIndex(actualIndex)}
              className={`relative h-28 w-full overflow-hidden rounded-xl border-2 transition sm:h-32 ${
                isActive
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border opacity-80 hover:opacity-100"
              }`}
            >
              {/* Storage hostnames vary by environment and are not known at build time. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`${title} thumbnail ${actualIndex}`}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
