import Link from "next/link";
import { ArrowRight, CarFront, Fuel, Gauge, Star, Users } from "lucide-react";

export type CarCardData = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  primaryImageUrl: string | null;
};

export function FeaturedCarCard({ car }: { car: CarCardData }) {
  return (
    <article className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/10">
      <div className="relative aspect-16/10 overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        {car.primaryImageUrl ? (
          // Supabase Storage URLs are dynamic, so a regular image keeps the card reusable across environments.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.primaryImageUrl}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CarFront className="size-20 text-slate-400 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
          {car.category}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <Star className="size-3 fill-amber-400 text-amber-400" /> 4.8
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">{car.brand}</p>
            <h3 className="mt-1 text-xl font-bold tracking-tight">{car.model}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{car.year} model</p>
          </div>
          <p className="text-right">
            <span className="text-2xl font-bold text-primary">${car.pricePerDay}</span>
            <span className="block text-xs text-muted-foreground">per day</span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-y py-4 text-xs text-muted-foreground">
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Gauge className="size-4 text-primary" />
            {car.transmission}
          </span>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Users className="size-4 text-primary" />
            {car.seats} seats
          </span>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Fuel className="size-4 text-primary" />
            {car.fuelType}
          </span>
        </div>

        <Link
          href={`/cars/${car.id}`}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white hover:bg-primary/90"
        >
          View Details
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
