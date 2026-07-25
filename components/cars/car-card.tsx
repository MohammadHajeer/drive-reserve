"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck2,
  CarFront,
  CheckCircle2,
  Fuel,
  Gauge,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { PublicCarListItem, PublicCarView } from "@/lib/cars/public-cars";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type CarCardVariant = "listing" | "featured";

type CarCardProps = {
  car: PublicCarListItem;
  view?: PublicCarView;
  variant?: CarCardVariant;
};

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function CarCard({
  car,
  view = "grid",
  variant = "listing",
}: CarCardProps) {
  const router = useRouter();
  const detailsHref = `/cars/${car.id}`;
  const isFeatured = variant === "featured";
  const isListView = variant === "listing" && view === "list";

  const handleNavigate = async (e: React.MouseEvent) => {
    e.preventDefault();

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      router.push(detailsHref);
    } else {
      router.push(`/login?redirectTo=${encodeURIComponent(detailsHref)}`);
    }
  };

  return (
    <article
      className={cn(
        "group min-w-0 overflow-hidden border bg-card shadow-sm transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg",
        isListView
          ? "rounded-2xl md:grid md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]"
          : "flex h-full flex-col rounded-xl",
      )}
    >
      <CarImage
        car={car}
        href={detailsHref}
        isListView={isListView}
        onNavigate={handleNavigate}
      />

      {isListView ? (
        <ListCardContent
          car={car}
          detailsHref={detailsHref}
          onNavigate={handleNavigate}
        />
      ) : (
        <GridCardContent
          car={car}
          detailsHref={detailsHref}
          isFeatured={isFeatured}
          onNavigate={handleNavigate}
        />
      )}
    </article>
  );
}

type CarImageProps = {
  car: PublicCarListItem;
  href: string;
  isListView: boolean;
  onNavigate: (e: React.MouseEvent) => Promise<void>;
};

function CarImage({ car, href, isListView, onNavigate }: CarImageProps) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      aria-label={`View ${car.brand} ${car.model}`}
      className={cn(
        "relative block overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isListView
          ? "aspect-16/10 md:aspect-auto md:h-full md:min-h-67.5"
          : "aspect-16/10",
      )}
    >
      {car.primaryImageUrl ? (
        // Storage hostnames vary by environment and are not known at build time.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={car.primaryImageUrl}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <CarFront className="size-16" aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}

      {isListView && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent"
          aria-hidden="true"
        />
      )}

      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
        {titleCase(car.category)}
      </span>

      {isListView && (
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          <CheckCircle2
            className="size-3.5 text-emerald-600"
            aria-hidden="true"
          />
          {titleCase(car.status)}
        </span>
      )}
    </a>
  );
}

type ListCardContentProps = {
  car: PublicCarListItem;
  detailsHref: string;
  onNavigate: (e: React.MouseEvent) => Promise<void>;
};

function ListCardContent({
  car,
  detailsHref,
  onNavigate,
}: ListCardContentProps) {
  return (
    <div className="grid min-w-0 md:min-h-67.5 lg:grid-cols-[minmax(0,1fr)_190px]">
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {car.year} {titleCase(car.category)}
          </p>

          <a
            href={detailsHref}
            onClick={onNavigate}
            className="mt-1 block w-fit rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h2 className="text-2xl font-bold tracking-tight transition-colors hover:text-primary">
              {car.brand} {car.model}
            </h2>
          </a>

          <p className="mt-2 text-sm text-muted-foreground">
            A comfortable {car.seats}-seat vehicle with{" "}
            {titleCase(car.transmission).toLowerCase()} transmission and{" "}
            {titleCase(car.fuelType).toLowerCase()} power.
          </p>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <CarSpecification
            icon={<Gauge className="size-5" aria-hidden="true" />}
            label="Transmission"
            value={titleCase(car.transmission)}
            layout="horizontal"
          />

          <CarSpecification
            icon={<Users className="size-5" aria-hidden="true" />}
            label="Capacity"
            value={`${car.seats} people`}
            layout="horizontal"
          />

          <CarSpecification
            icon={<Fuel className="size-5" aria-hidden="true" />}
            label="Fuel type"
            value={titleCase(car.fuelType)}
            layout="horizontal"
          />
        </dl>

        <div className="mt-auto hidden pt-5 lg:block">
          <a
            href={detailsHref}
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Explore vehicle details
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <aside className="flex flex-col justify-between border-t bg-primary/[0.035] p-5 lg:border-l lg:border-t-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Daily rate
          </p>

          <p className="mt-1">
            <span className="text-3xl font-bold tracking-tight text-primary">
              ${car.pricePerDay}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">/ day</span>
          </p>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-800">
            <CalendarCheck2
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />

            <div>
              <p className="text-xs font-semibold">Available for booking</p>
              <p className="mt-0.5 text-[11px] text-emerald-700">
                Select dates to check availability.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={onNavigate}
            className={cn(buttonVariants(), "h-10 w-full rounded-lg")}
          >
            Book Now
          </button>

          <a
            href={detailsHref}
            onClick={onNavigate}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full rounded-lg bg-background text-center flex items-center justify-center",
            )}
          >
            View Details
          </a>
        </div>
      </aside>
    </div>
  );
}

type GridCardContentProps = {
  car: PublicCarListItem;
  detailsHref: string;
  isFeatured: boolean;
  onNavigate: (e: React.MouseEvent) => Promise<void>;
};

function GridCardContent({
  car,
  detailsHref,
  isFeatured,
  onNavigate,
}: GridCardContentProps) {
  const availability = titleCase(car.status);

  return (
    <div className="flex min-w-0 flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={detailsHref}
            onClick={onNavigate}
            className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h2 className="truncate text-lg font-semibold tracking-tight transition-colors hover:text-primary">
              {car.brand} {car.model}
            </h2>
          </a>

          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{car.year}</span>

            {isFeatured ? (
              <span>model</span>
            ) : (
              <>
                <span aria-hidden="true">•</span>

                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {availability}
                </span>
              </>
            )}
          </p>
        </div>

        <p className="shrink-0 text-right">
          <span className="block text-xl font-bold text-primary">
            ${car.pricePerDay}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            per day
          </span>
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        <CarSpecification
          icon={<Gauge className="size-4" aria-hidden="true" />}
          label="Trans"
          value={titleCase(car.transmission)}
        />

        <CarSpecification
          icon={<Users className="size-4" aria-hidden="true" />}
          label="Seats"
          value={`${car.seats} people`}
        />

        <CarSpecification
          icon={<Fuel className="size-4" aria-hidden="true" />}
          label="Fuel"
          value={titleCase(car.fuelType)}
        />
      </dl>

      {isFeatured ? (
        <div className="mt-auto border-t pt-4">
          <a
            href={detailsHref}
            onClick={onNavigate}
            className={cn(buttonVariants(), "h-10 w-full rounded-lg text-center flex items-center justify-center gap-1.5")}
          >
            View Details
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-4">
          <a
            href={detailsHref}
            onClick={onNavigate}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-lg text-center flex items-center justify-center",
            )}
          >
            Details
          </a>

          <button
            type="button"
            onClick={onNavigate}
            className={cn(buttonVariants(), "h-9 rounded-lg")}
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
}

type CarSpecificationProps = {
  icon: ReactNode;
  label: string;
  value: string;
  layout?: "stacked" | "horizontal";
};

function CarSpecification({
  icon,
  label,
  value,
  layout = "stacked",
}: CarSpecificationProps) {
  if (layout === "horizontal") {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-muted/35 p-3 transition-colors group-hover:bg-muted/55">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-xs">
          {icon}
        </div>

        <div className="min-w-0">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-0.5 truncate text-sm font-semibold" title={value}>
            {value}
          </dd>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border bg-muted/50 px-2 py-2 text-center">
      <div className="flex justify-center text-muted-foreground">{icon}</div>

      <dt className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-0.5 truncate text-[11px] font-medium" title={value}>
        {value}
      </dd>
    </div>
  );
}