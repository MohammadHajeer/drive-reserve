import { Mail, Phone, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservationDetail } from "@/features/customer/reservations/customer-reservations.schema";

export function ReservationCustomerCard({
  customer,
}: {
  customer: CustomerReservationDetail["customer"];
}) {
  const details = [
    customer.email ? { label: "Email", value: customer.email, icon: Mail } : null,
    customer.phone ? { label: "Phone", value: customer.phone, icon: Phone } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Card>
      <CardContent>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <UserRound className="size-5 text-primary" aria-hidden="true" />
          Renter information
        </h2>
        <p className="mt-3 font-semibold">
          {customer.fullName || "Customer profile"}
        </p>

        {details.length ? (
          <dl className="mt-4 space-y-3">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3 text-sm">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="break-words font-medium">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Contact details are not present on the customer profile.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
