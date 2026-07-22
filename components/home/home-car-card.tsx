import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Fuel,
  Gauge,
  Users,
} from "lucide-react";

export interface HomeCarCardData {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  status: string;
  primaryImageUrl: string | null;
}

interface HomeCarCardProps {
  car: HomeCarCardData;
}

export function HomeCarCard({ car }: HomeCarCardProps) {
  const isAvailable = car.status.toLowerCase() === "available";

  return (
    <article className="group overflow-hidden rounded-2xl border bg-background shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {car.primaryImageUrl ? (
          <Image
            src={car.primaryImageUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {car.category}
        </span>

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {car.status}
        </span>
      </div>

      <div className="p-5">
        <div>
          <p className="text-sm text-muted-foreground">{car.brand}</p>

          <h3 className="mt-1 text-xl font-bold text-foreground">
            {car.model}
          </h3>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <span>{car.year}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>{car.seats} seats</span>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <span>{car.transmission}</span>
          </div>

          <div className="flex items-center gap-2">
            <Fuel className="size-4 text-primary" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between border-t pt-5">
          <div>
            <span className="text-2xl font-bold text-foreground">
              ${car.pricePerDay}
            </span>
            <span className="text-sm text-muted-foreground"> / day</span>
          </div>

          <Link
            href={`/cars/${car.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}