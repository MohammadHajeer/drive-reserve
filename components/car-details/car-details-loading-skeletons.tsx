import { CarCardSkeleton } from "@/components/cars/cars-loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export function GallerySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-85 w-full rounded-2xl sm:h-105" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl sm:h-32" />
        ))}
      </div>
    </div>
  );
}

export function ReservationCardSkeleton() {
  return (
    <div
      className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
      <Skeleton className="mt-6 h-16 w-full rounded-xl" />
      <div className="mt-5 grid grid-cols-7 gap-2">
        {Array.from({ length: 14 }, (_, index) => (
          <Skeleton key={index} className="aspect-square rounded-md" />
        ))}
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-lg" />
    </div>
  );
}

export function RelatedCarsSkeleton() {
  return (
    <section
      className="mx-auto mt-12 max-w-7xl"
      aria-busy="true"
      aria-label="Loading related cars"
    >
      <span className="sr-only">Loading related cars</span>
      <div aria-hidden="true">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <CarCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CarDetailsPageSkeleton() {
  return (
    <main
      className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading vehicle details"
    >
      <span className="sr-only">Loading vehicle details</span>
      <div className="mx-auto max-w-7xl">
        <Skeleton className="mb-6 h-5 w-32" aria-hidden="true" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <GallerySkeleton />
            <div className="space-y-3 pt-2" aria-hidden="true">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-9 w-3/5" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-20 rounded-xl" />
              ))}
            </div>
            <div className="space-y-4 border-t pt-5" aria-hidden="true">
              <div className="flex gap-6">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
          <aside className="lg:col-span-5 xl:col-span-4">
            <ReservationCardSkeleton />
          </aside>
        </div>
        <RelatedCarsSkeleton />
      </div>
    </main>
  );
}
