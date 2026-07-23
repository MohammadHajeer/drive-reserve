import type { Metadata } from "next";

import { CarsFilters } from "@/components/cars/cars-filters";
import { CarsPageHeader } from "@/components/cars/cars-page-header";
import { CarsPageLayout } from "@/components/cars/cars-page-layout";
import { CarsResults } from "@/components/cars/cars-results";
import { CarsSearch } from "@/components/cars/cars-search";
import { MobileCarsFilters } from "@/components/cars/mobile-cars-filters";
import type {
  PublicCarsPagination,
  PublicCarsPriceRange,
  PublicCarsSearchParams,
} from "@/lib/cars/public-cars";
import {
  getPublicCars,
  normalizePublicCarsFilters,
} from "@/lib/server/cars/get-public-cars";

export const metadata: Metadata = {
  title: "Available Vehicles",
  description: "Browse and filter the vehicles available from DriveReserve.",
};

const emptyPagination: PublicCarsPagination = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<PublicCarsSearchParams>;
}) {
  const rawSearchParams = await searchParams;
  const filters = normalizePublicCarsFilters(rawSearchParams);
  const result = await getPublicCars(filters);

  const cars = result.success ? result.data.cars : [];
  const pagination = result.success
    ? result.data.pagination
    : { ...emptyPagination, page: filters.page };
  const priceRange: PublicCarsPriceRange = result.success
    ? result.data.priceRange
    : {
        min: 0,
        max: Math.max(5, filters.maxPrice ?? 5),
        step: 5,
      };

  return (
    <CarsPageLayout
      header={<CarsPageHeader filters={filters} />}
      sidebar={<CarsFilters filters={filters} priceRange={priceRange} />}
      search={
        <CarsSearch
          q={filters.q}
          total={pagination.total}
          mobileFilters={
            <MobileCarsFilters filters={filters} priceRange={priceRange} />
          }
        />
      }
      results={
        <CarsResults
          cars={cars}
          pagination={pagination}
          view={filters.view}
          errorMessage={result.success ? undefined : result.error.message}
        />
      }
    />
  );
}