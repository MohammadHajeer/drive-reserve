import Image from "next/image";
import {
  CalendarDays,
  CarFront,
  Fuel,
  Gauge,
  Hash,
  Palette,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservationDetail } from "@/features/customer/reservations/customer-reservations.schema";

export function ReservationVehicleCard({
  car,
}: {
  car: CustomerReservationDetail["car"];
}) {
  const carName = [car.brand, car.model].filter(Boolean).join(" ");
  const details = [
    car.year ? { label: "Year", value: String(car.year), icon: CalendarDays } : null,
    car.transmission
      ? { label: "Transmission", value: car.transmission, icon: Gauge }
      : null,
    car.fuelType ? { label: "Fuel", value: car.fuelType, icon: Fuel } : null,
    car.seats ? { label: "Seats", value: String(car.seats), icon: Users } : null,
    car.color ? { label: "Color", value: car.color, icon: Palette } : null,
    car.plateNumber
      ? { label: "Plate number", value: car.plateNumber, icon: Hash }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="relative flex h-52 w-full shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-muted md:h-44 md:w-64">
            {car.imageUrl ? (
              <Image
                src={car.imageUrl}
                alt={carName || "Reserved vehicle"}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            ) : (
              <CarFront className="size-10 text-muted-foreground" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary">Vehicle details</p>
            <h2 className="mt-1 text-xl font-bold">
              {carName || "Vehicle details unavailable"}
            </h2>
            {car.category && (
              <p className="mt-1 capitalize text-muted-foreground">{car.category}</p>
            )}

            {details.length ? (
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl bg-muted/50 p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="size-3.5" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 truncate text-sm font-semibold capitalize">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                The vehicle relation is unavailable, but the reservation dates and
                pricing remain valid.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
