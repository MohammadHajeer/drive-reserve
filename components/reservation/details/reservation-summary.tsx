import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservationDetail } from "@/features/customer/reservations/customer-reservations.schema";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ReservationSummary({
  reservation,
}: {
  reservation: CustomerReservationDetail;
}) {
  const items = [
    {
      label: "Reservation",
      value: reservation.id.slice(0, 8).toUpperCase(),
      detail: "Reservation ID",
    },
    {
      label: "Total price",
      value: currency.format(reservation.totalPrice),
      detail: "Rental total",
    },
    {
      label: "Rental period",
      value: `${reservation.rentalDays} ${reservation.rentalDays === 1 ? "day" : "days"}`,
      detail: "Rental duration",
    },
    {
      label: "Submitted",
      value: formatDate(reservation.createdAt),
      detail: `Last updated ${formatDate(reservation.updatedAt)}`,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Reservation summary">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardContent>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-base font-bold tabular-nums">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
