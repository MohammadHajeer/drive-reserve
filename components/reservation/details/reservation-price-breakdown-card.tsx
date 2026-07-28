import { ReceiptText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservationDetail } from "@/features/customer/reservations/customer-reservations.schema";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ReservationPriceBreakdownCard({
  reservation,
}: {
  reservation: CustomerReservationDetail;
}) {
  return (
    <Card>
      <CardContent>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ReceiptText className="size-5 text-primary" aria-hidden="true" />
          Price breakdown
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pricing captured when the reservation was submitted.
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 text-muted-foreground">
            <dt>
              {currency.format(reservation.pricePerDaySnapshot)} ×{" "}
              {reservation.rentalDays} {reservation.rentalDays === 1 ? "day" : "days"}
            </dt>
            <dd className="font-medium text-foreground">
              {currency.format(reservation.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t pt-3">
            <dt className="font-bold">Total price</dt>
            <dd className="text-lg font-bold text-primary">
              {currency.format(reservation.totalPrice)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
