import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { DEFAULT_PUBLIC_CARS_FILTERS } from "@/lib/cars/public-cars";
import { getPublicCars } from "@/lib/server/cars/get-public-cars";
import { FeaturedCarCard } from "./featured-car-card";

export async function FeaturedCars() {
  const result = await getPublicCars(
    { ...DEFAULT_PUBLIC_CARS_FILTERS, sort: "newest" },
    { limit: 3 },
  );
  const cars = result.success ? result.data.cars : [];

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

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <FeaturedCarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
