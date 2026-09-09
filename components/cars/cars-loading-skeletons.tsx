import { Skeleton } from "@/components/ui/skeleton";
import type { PublicCarView } from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

export function CarCardSkeleton({
  view = "grid",
}: {
  view?: PublicCarView;
}) {
  const isList = view === "list";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        isList &&
          "md:grid md:min-h-67.5 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]",
      )}
      aria-hidden="true"
    >
      <Skeleton
        className={cn(
          "aspect-16/10 rounded-none",
          isList && "md:aspect-auto md:h-full",
        )}
      />
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="ml-auto h-6 w-16" />
            <Skeleton className="ml-auto h-3 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function CarsGridSkeleton({
  count = 6,
  view = "grid",
}: {
  count?: number;
  view?: PublicCarView;
}) {
  return (
    <div aria-busy="true" aria-label="Loading vehicle results">
      <span className="sr-only">Loading vehicle results</span>
      <div
        className={cn(
          "grid min-w-0 gap-4",
          view === "grid" && "sm:grid-cols-2 xl:grid-cols-3",
          view === "list" && "grid-cols-1",
        )}
      >
        {Array.from({ length: count }, (_, index) => (
          <CarCardSkeleton key={index} view={view} />
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="size-9 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function CarsPageSkeleton() {
  return (
    <main
      className="min-h-screen overflow-x-clip bg-background py-8 container-paddings lg:py-10"
      aria-busy="true"
      aria-label="Loading available vehicles"
    >
      <span className="sr-only">Loading available vehicles</span>
      <div className="mx-auto max-w-7xl" aria-hidden="true">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2.5">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-xl sm:w-120" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl sm:w-72" />
        </header>

        <section className="mt-6 overflow-hidden rounded-2xl border bg-card" aria-hidden="true">
          <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 items-start gap-4">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-72 max-w-full" />
                <Skeleton className="h-4 w-full max-w-xl sm:w-105" />
              </div>
            </div>
            <Skeleton className="h-10 w-full shrink-0 rounded-lg sm:w-32" />
          </div>
        </section>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="hidden self-start rounded-xl border bg-card p-5 shadow-sm lg:block">
            <div className="space-y-6">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 5 }, (_, group) => (
                <div key={group} className="space-y-3 border-t pt-5 first:border-0 first:pt-0">
                  <Skeleton className="h-3 w-28" />
                  {Array.from({ length: group === 0 ? 5 : 3 }, (_, row) => (
                    <div key={row} className="flex items-center gap-2.5">
                      <Skeleton className="size-4 rounded-sm" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 min-w-0 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg lg:hidden" />
              <Skeleton className="h-3 w-20" />
            </div>
            <CarsGridSkeleton />
          </section>
        </div>
      </div>
    </main>
  );
}
