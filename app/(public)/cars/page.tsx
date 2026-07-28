import type { Metadata } from "next";
import { Suspense } from "react";

import { CarsFilters } from "@/components/cars/cars-filters";
import { CarsGridSkeleton } from "@/components/cars/cars-loading-skeletons";
import { CarsPageHeader } from "@/components/cars/cars-page-header";
import { CarsPageLayout } from "@/components/cars/cars-page-layout";
import { CarsResults } from "@/components/cars/cars-results";
import { CarsSearch } from "@/components/cars/cars-search";
import { MobileCarsFilters } from "@/components/cars/mobile-cars-filters";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PublicCarView,
  PublicCarsPagination,
  PublicCarsSearchParams,
} from "@/lib/cars/public-cars";
import {
  getPublicCars,
  getPublicCarsPriceRange,
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
  const priceRangePromise = getPublicCarsPriceRange();
  const resultPromise = getPublicCars(filters, {
    priceRange: priceRangePromise,
  });
  const resultsKey = JSON.stringify(filters);

  return (
    <CarsPageLayout
      header={<CarsPageHeader filters={filters} />}
      sidebar={
        <CarsFilters filters={filters} priceRangePromise={priceRangePromise} />
      }
      search={
        <CarsSearch
          q={filters.q}
          total={
            <Suspense key={resultsKey} fallback={<ResultCountSkeleton />}>
              <CarsResultCount resultPromise={resultPromise} />
            </Suspense>
          }
          mobileFilters={
            <MobileCarsFilters
              filters={filters}
              priceRangePromise={priceRangePromise}
            />
          }
        />
      }
      results={
        <Suspense
          key={resultsKey}
          fallback={<CarsGridSkeleton view={filters.view} />}
        >
          <CarsResultsSection
            page={filters.page}
            view={filters.view}
            resultPromise={resultPromise}
          />
        </Suspense>
      }
    />
  );
}

type PublicCarsResultPromise = ReturnType<typeof getPublicCars>;

async function CarsResultCount({
  resultPromise,
}: {
  resultPromise: PublicCarsResultPromise;
}) {
  const result = await resultPromise;
  const total = result.success ? result.data.pagination.total : 0;

  return (
    <>
      {total} {total === 1 ? "vehicle" : "vehicles"}
    </>
  );
}

function ResultCountSkeleton() {
  return (
    <Skeleton
      className="inline-block h-3 w-20 rounded-full"
      aria-label="Loading vehicle count"
    />
  );
}

async function CarsResultsSection({
  page,
  view,
  resultPromise,
}: {
  page: number;
  view: PublicCarView;
  resultPromise: PublicCarsResultPromise;
}) {
  const result = await resultPromise;
  const cars = result.success ? result.data.cars : [];
  const pagination = result.success
    ? result.data.pagination
    : { ...emptyPagination, page };

  return (
    <CarsResults
      cars={cars}
      pagination={pagination}
      view={view}
      errorMessage={result.success ? undefined : result.error.message}
    />
  );
}
