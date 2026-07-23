import Link from "next/link";
import {
  CarFront,
  CheckCircle2,
  Fuel,
  Gauge,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type {
  PublicCarListItem,
  PublicCarView,
} from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

type CarCardProps = {
  car: PublicCarListItem;
  view?: PublicCarView;
};

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function CarCard({ car, view = "grid" }: CarCardProps) {
  const detailsHref = `/cars/${car.id}`;
  const availability = titleCase(car.status);

  return (
    <article
      className={cn(
        "group min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        view === "list" && "md:grid md:grid-cols-[260px_minmax(0,1fr)]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden bg-muted",
          view === "list" && "md:aspect-auto md:min-h-64",
        )}
      >
        {car.primaryImageUrl ? (
          // Storage hostnames vary by environment and are not known at build time.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.primaryImageUrl}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <CarFront className="size-16" aria-hidden="true" />
            <span className="text-xs">Image unavailable</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
          {car.category}
        </span>
      </div>

      <div className="flex min-w-0 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {car.brand} {car.model}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{car.year}</span>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {availability}
              </span>
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-xl font-bold text-primary">
              ${car.pricePerDay}
            </span>
            <span className="block text-[11px] text-muted-foreground">per day</span>
          </p>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <div className="min-w-0 rounded-lg border bg-muted/50 px-2 py-2 text-center">
            <Gauge className="mx-auto size-4 text-muted-foreground" aria-hidden="true" />
            <dt className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Trans
            </dt>
            <dd className="mt-0.5 truncate text-[11px] font-medium">
              {titleCase(car.transmission)}
            </dd>
          </div>
          <div className="min-w-0 rounded-lg border bg-muted/50 px-2 py-2 text-center">
            <Users className="mx-auto size-4 text-muted-foreground" aria-hidden="true" />
            <dt className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Seats
            </dt>
            <dd className="mt-0.5 truncate text-[11px] font-medium">
              {car.seats} people
            </dd>
          </div>
          <div className="min-w-0 rounded-lg border bg-muted/50 px-2 py-2 text-center">
            <Fuel className="mx-auto size-4 text-muted-foreground" aria-hidden="true" />
            <dt className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Fuel
            </dt>
            <dd className="mt-0.5 truncate text-[11px] font-medium">
              {titleCase(car.fuelType)}
            </dd>
          </div>
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-4">
          <Link
            href={detailsHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-lg",
            )}
          >
            Details
          </Link>
          <Link
            href={detailsHref}
            className={cn(buttonVariants(), "h-9 rounded-lg")}
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}