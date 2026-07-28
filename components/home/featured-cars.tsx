"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeading } from "@/components/common/section-heading";
import type { PublicCarListItem } from "@/lib/cars/public-cars";
import { CarCard } from "../cars/car-card";

type FeaturedCarsResponse = {
  success: boolean;
  data?: {
    cars?: PublicCarListItem[];
  };
};

async function fetchFeaturedCars(signal: AbortSignal) {
  const response = await fetch("/api/cars/featured", {
    cache: "no-store",
    signal,
  });
  const result = (await response.json()) as FeaturedCarsResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data?.cars)) {
    throw new Error("Unable to load featured cars.");
  }

  return result.data.cars;
}

export function FeaturedCars() {
  const { data: cars = [], isError, isLoading } = useQuery({
    queryKey: ["public-cars", "featured"],
    queryFn: ({ signal }) => fetchFeaturedCars(signal),
  });

  return (
    <section
      id="featured-cars"
      className="border-y bg-muted/40 py-20 sm:py-24 container-paddings"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured cars"
            title="Popular vehicles ready for your next trip"
            description="Explore a selection of available cars chosen for comfort, reliability, and value."
            align="left"
            className="mx-0"
          />
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            View all cars <ArrowRight className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <FeaturedCarsSkeleton />
        ) : isError ? (
          <p className="mt-12 rounded-xl border bg-background p-6 text-sm text-muted-foreground">
            Featured cars are temporarily unavailable. You can still browse the
            complete vehicle catalog.
          </p>
        ) : cars.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} variant="featured" />
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-xl border bg-background p-6 text-sm text-muted-foreground">
            No featured cars are available right now.
          </p>
        )}
      </div>
    </section>
  );
}

function FeaturedCarsSkeleton() {
  return (
    <div
      className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading featured cars"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-96 animate-pulse rounded-xl border bg-background"
        />
      ))}
    </div>
  );
}
