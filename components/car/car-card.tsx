import Image from "next/image";
import { BatteryCharging, Fuel, Users, Wind } from "lucide-react";
import type { CarListItem } from "@/lib/mock-cars";

type CarCardProps = {
  car: CarListItem;
};

export function CarCard({ car }: CarCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm shadow-slate-950/5">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <Image
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          fill 
          unoptimized
          className="object-cover object-center transition duration-300 hover:scale-105"
        />
        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase shadow-sm ${
            car.status === "Available"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {car.status}
        </span>
      </div>

    

      <div className="flex flex-1 flex-col space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {car.category}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold text-foreground">
                {car.brand} {car.model}
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                {car.year} · {car.location}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-semibold text-foreground">
                ${car.pricePerDay}
              </p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-2.5 py-2">
            <Users className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{car.seats} seats</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-2.5 py-2">
            <Wind className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-2.5 py-2">
            <Fuel className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-2.5 py-2">
            <BatteryCharging className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{car.year}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-row gap-2">
          <button
            type="button"
            disabled={car.status !== "Available"}
            className="inline-flex w-1/2 items-center justify-center whitespace-nowrap rounded-2xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
            {car.status === "Available" ? "Book now" : "Unavailable"}
          </button>
          <button
            type="button"
            className="inline-flex w-1/2 items-center justify-center whitespace-nowrap rounded-2xl border border-border bg-card px-2 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted sm:text-sm">
          View details
        </button>
        </div>
      </div>
    </article>
  );
}