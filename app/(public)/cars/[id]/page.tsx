import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { CarDetailsTabs } from "@/components/car-details/car-details-tabs";
import { CarGallery } from "@/components/car-details/car-gallery";
import { CarSpecs } from "@/components/car-details/car-specs";
import { ReservationCard } from "@/components/car-details/reservation-card";
import { getPublicCarById } from "@/lib/server/cars/get-public-car-by-id";

export default async function CarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPublicCarById(id);

  if (!result.success) {
    if (
      result.error.code === "INVALID_CAR_ID" ||
      result.error.code === "CAR_NOT_FOUND"
    ) {
      notFound();
    }

    throw new Error(result.error.message);
  }

  const { car } = result.data;
  const title = `${car.brand} ${car.model}`;

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between pb-6">
          <Link
            href="/cars"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back to Listings
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <CarGallery
              images={car.images.map((image) => image.url)}
              title={title}
            />

            <div className="pt-2">
              <span className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs font-semibold uppercase text-secondary-foreground">
                {car.category}
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title} ({car.year})
              </h1>
            </div>

            <CarSpecs
              year={car.year}
              transmission={car.transmission}
              fuelType={car.fuelType}
              seats={car.seats}
            />

            <CarDetailsTabs
              description={car.description}
              features={car.features}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24">
              <ReservationCard
                carId={car.id}
                pricePerDay={car.pricePerDay}
                status={car.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
