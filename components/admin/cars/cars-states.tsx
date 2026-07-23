import { CarFront, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CarsLoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="h-14 animate-pulse border-b bg-slate-100" />
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-b p-4 last:border-b-0">
          <div className="h-14 w-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
          <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 md:block" />
          <div className="hidden h-4 w-20 animate-pulse rounded bg-slate-100 lg:block" />
        </div>
      ))}
    </div>
  );
}

export function CarsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-blue-600"><CarFront /></span>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">No cars found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Try changing your search or filters to see more vehicles.</p>
      <Button className="mt-5" variant="outline" onClick={onReset}>Reset filters</Button>
    </div>
  );
}

export function CarsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-red-900">Could not load the fleet</h2>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      <Button className="mt-5" variant="outline" onClick={onRetry}><RefreshCw /> Retry</Button>
    </div>
  );
}
