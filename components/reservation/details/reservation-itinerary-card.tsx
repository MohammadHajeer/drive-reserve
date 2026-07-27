"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";

export function ReservationItineraryCard({ reservation }: { reservation: CustomerReservation }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="p-6 h-60 animate-pulse bg-muted/20 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Itinerary & Location
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg border">
          <div className="flex items-start gap-3">
            <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase">
                Pick-Up
              </span>
              <p className="font-semibold text-foreground">
                {reservation.pickupDate} at 10:00 AM
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Downtown Mobility Hub, Block A</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase">
                Return
              </span>
              <p className="font-semibold text-foreground">
                {reservation.returnDate} at 10:00 AM
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Downtown Mobility Hub, Block A</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-60 rounded-lg overflow-hidden border shadow-inner bg-slate-100">
          <a
            href="https://maps.google.com/maps?q=Downtown%20Beirut%20Central%20District"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-background/95 backdrop-blur px-3 py-1.5 rounded-md border text-xs font-medium shadow-sm hover:bg-background"
          >
            Open in Maps
            <ExternalLink className="w-3 h-3" />
          </a>
          <iframe
            title="Downtown Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src="https://maps.google.com/maps?q=Downtown%20Beirut%20Central%20District&t=&z=15&ie=UTF8&iwloc=B&output=embed"
          />
        </div>
      </CardContent>
    </Card>
  );
}