"use client";

import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Fuel,
  Gauge,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AiCarRecommendationView } from "@/lib/actions/ai-car-recommendations";
import { cn } from "@/lib/utils";

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function AiCarRecommendations({
  recommendations,
  onEditPreferences,
}: {
  recommendations: AiCarRecommendationView[];
  onEditPreferences: () => void;
}) {
  if (recommendations.length === 0) return null;

  return (
    <section
      aria-labelledby="ai-recommendations-heading"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border bg-card"
    >
      <div className="flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Recommended for your trip
            </p>
            <h2
              id="ai-recommendations-heading"
              className="mt-1 text-lg font-semibold tracking-tight"
            >
              Your strongest DriveReserve matches
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              These vehicles already passed your availability, passenger,
              budget, transmission, and fuel requirements.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={onEditPreferences}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Edit preferences
        </Button>
      </div>

      <div className="grid gap-4 bg-muted/20 p-4 sm:p-5 lg:grid-cols-3">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.car.id}
            recommendation={recommendation}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({
  recommendation,
  rank,
}: {
  recommendation: AiCarRecommendationView;
  rank: number;
}) {
  const { car, label, reason } = recommendation;
  const detailsHref = `/cars/${car.id}`;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <Link
        href={detailsHref}
        aria-label={`View ${car.brand} ${car.model}`}
        className="relative block aspect-16/10 overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <CarFront className="size-14" aria-hidden="true" />
            <span className="text-xs">Image unavailable</span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
          {label}
        </span>

        <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-white/20 bg-background/90 text-xs font-bold text-foreground backdrop-blur">
          {rank}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {car.year} {titleCase(car.category)}
            </p>
            <Link
              href={detailsHref}
              className="mt-0.5 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h3 className="truncate text-lg font-semibold tracking-tight transition-colors hover:text-primary">
                {car.brand} {car.model}
              </h3>
            </Link>
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

        <p className="mt-3 text-sm leading-6 text-muted-foreground">{reason}</p>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <Specification
            icon={<Gauge className="size-4" aria-hidden="true" />}
            label="Trans"
            value={titleCase(car.transmission)}
          />
          <Specification
            icon={<Users className="size-4" aria-hidden="true" />}
            label="Seats"
            value={`${car.seats} people`}
          />
          <Specification
            icon={<Fuel className="size-4" aria-hidden="true" />}
            label="Fuel"
            value={titleCase(car.fuelType)}
          />
        </dl>

        <div className="mt-auto border-t pt-4">
          <Link
            href={detailsHref}
            className={cn(
              buttonVariants(),
              "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg",
            )}
          >
            View vehicle
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Specification({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
