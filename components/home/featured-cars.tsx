import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CarCard, type CarCardData } from "@/components/cars/car-card";
import { SectionHeading } from "@/components/common/section-heading";
import { getPublicCars } from "@/lib/server/cars/get-public-cars";

const fallbackCars: CarCardData[] = [
  { id: "featured-mercedes", brand: "Mercedes-Benz", model: "C-Class", year: 2025, category: "Luxury", transmission: "Automatic", fuelType: "Petrol", seats: 5, pricePerDay: 95, primaryImageUrl: null },
  { id: "featured-bmw", brand: "BMW", model: "X5", year: 2025, category: "SUV", transmission: "Automatic", fuelType: "Hybrid", seats: 5, pricePerDay: 135, primaryImageUrl: null },
  { id: "featured-toyota", brand: "Toyota", model: "Corolla", year: 2024, category: "Economy", transmission: "Automatic", fuelType: "Petrol", seats: 5, pricePerDay: 48, primaryImageUrl: null },
];

export async function FeaturedCars() {
  const result = await getPublicCars({ limit: "3", sort: "newest" });
const cars =
  result.success &&
  result.data &&
  result.data.cars.length > 0
    ? result.data.cars
    : fallbackCars;

  return (
    <section id="featured-cars" className="border-y bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured cars"
            title="Popular vehicles ready for your next trip"
            description="Explore a selection of available cars chosen for comfort, reliability, and value."
            align="left"
            className="mx-0"
          />
          <Link href="/cars" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            View all cars <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      </div>
    </section>
  );
}
