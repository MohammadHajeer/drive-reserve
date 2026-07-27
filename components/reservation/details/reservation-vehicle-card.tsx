"use client";

import { CarFront, Clock, Fuel, Gauge, Users } from "lucide-react";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";

const DEFAULT_SEATS = 5;
const DEFAULT_DRIVE = "Automatic";
const DEFAULT_ENGINE = "Petrol";
const DEFAULT_YEAR = 2022;

export function ReservationVehicleCard({ car }: { car: CustomerReservation["car"] }) {
  const category = car.category ?? "Sedan";

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative w-full md:w-56 h-36 rounded-lg overflow-hidden bg-muted shrink-0">
          {car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.imageUrl}
              alt={car.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              <CarFront className="size-8" />
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wide bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
              {category}
            </span>
            <h2 className="text-xl font-bold mt-2">{car.name}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Seats
              </span>
              <span className="text-xs font-semibold">{DEFAULT_SEATS}</span>
            </div>

            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Gauge className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Drive
              </span>
              <span className="text-xs font-semibold capitalize">{DEFAULT_DRIVE}</span>
            </div>

            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Fuel className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Engine
              </span>
              <span className="text-xs font-semibold capitalize">{DEFAULT_ENGINE}</span>
            </div>

            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Year
              </span>
              <span className="text-xs font-semibold">{DEFAULT_YEAR}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

