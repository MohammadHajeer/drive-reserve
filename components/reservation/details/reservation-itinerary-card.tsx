import Link from "next/link";
import { CalendarDays, Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ReservationItineraryCardProps = {
  editHref?: string;
  pickupDate: string;
  rentalDays: number;
  returnDate: string;
};

export function ReservationItineraryCard({
  editHref,
  pickupDate,
  rentalDays,
  returnDate,
}: ReservationItineraryCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
              Rental schedule
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {rentalDays} {rentalDays === 1 ? "rental day" : "rental days"}
            </p>
          </div>
          {editHref && (
            <Link
              href={editHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit dates
            </Link>
          )}
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-muted/50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pick-up date
            </dt>
            <dd className="mt-2 font-semibold">{formatDate(pickupDate)}</dd>
          </div>
          <div className="rounded-3xl bg-muted/50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Return date
            </dt>
            <dd className="mt-2 font-semibold">{formatDate(returnDate)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
