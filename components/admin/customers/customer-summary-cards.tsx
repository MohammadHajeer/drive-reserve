import { CalendarCheck2, ShieldCheck, Timer, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AdminCustomersSummary } from "@/features/admin/customers/admin-customer.types";

const items = [
  { key: "totalCustomers", label: "Total customers", icon: Users },
  { key: "activeReservations", label: "Active rentals", icon: CalendarCheck2 },
  { key: "upcomingReservations", label: "Upcoming bookings", icon: Timer },
  {
    key: "newCustomersThisMonth",
    label: "New this month",
    icon: ShieldCheck,
  },
] as const;

export function CustomerSummaryCards({
  summary,
}: {
  summary: AdminCustomersSummary;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{summary[key]}</p>
            </div>
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
