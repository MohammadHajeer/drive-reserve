import { Skeleton } from "@/components/ui/skeleton";

export function ConfirmationPageSkeleton() {
  return (
    <main
      className="mx-auto min-h-screen max-w-7xl bg-background px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading reservation confirmation"
    >
      <span className="sr-only">Loading reservation confirmation</span>
      <div aria-hidden="true">
        <Skeleton className="mb-6 h-5 w-36" />
        <Skeleton className="mb-8 h-8 w-72" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <Skeleton className="h-36 w-full shrink-0 rounded-lg md:w-56" />
                <div className="w-full flex-1 space-y-4">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-7 w-52" />
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                      <Skeleton key={index} className="h-16 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <Skeleton className="h-6 w-44" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            </div>
          </div>
          <aside className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
            <Skeleton className="h-7 w-32" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-px w-full rounded-none" />
              <div className="flex justify-between gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
              <Skeleton className="mt-8 h-12 w-full rounded-lg" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
