import Image from "next/image";
import { BatteryCharging, Fuel, Users, Wind } from "lucide-react";
import type { CarListItem } from "@/lib/mock-cars";

type CarCardProps = {
  car: CarListItem;
};

export function CarCard({ car }: CarCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm shadow-slate-950/5">
      <div className="relative overflow-hidden bg-slate-100">
        <Image
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          width={1200}
          height={800}
          unoptimized
          className="h-52 w-full object-cover transition duration-300 hover:scale-105"
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase shadow-sm ${
            car.status === "Available"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {car.status}
        </span>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {car.category}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                {car.brand} {car.model}
              </h2>
              <p className="text-sm text-muted-foreground">
                {car.year} · {car.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">
                ${car.pricePerDay}
              </p>
              <p className="text-sm text-muted-foreground">per day</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-3xl border border-border bg-muted px-3 py-3">
            <Users className="size-4 text-primary" />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center gap-2 rounded-3xl border border-border bg-muted px-3 py-3">
            <Wind className="size-4 text-primary" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 rounded-3xl border border-border bg-muted px-3 py-3">
            <Fuel className="size-4 text-primary" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 rounded-3xl border border-border bg-muted px-3 py-3">
            <BatteryCharging className="size-4 text-primary" />
            <span>{car.year}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={car.status !== "Available"}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:w-auto"
          >
            {car.status === "Available" ? "Book now" : "Not available"}
          </button>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-3xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted sm:w-auto"
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}
