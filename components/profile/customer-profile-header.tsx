import { CalendarDays } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerProfile } from "@/features/customer/profile/customer-profile.schema";

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function CustomerProfileHeader({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const displayName = profile.fullName || "DriveReserve customer";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-4 ring-primary/5">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your DriveReserve account information.
            </p>
            <Badge variant="secondary" className="mt-3">
              <CalendarDays aria-hidden="true" />
              Member since {monthYearFormatter.format(new Date(profile.createdAt))}
            </Badge>
          </div>
        </div>
        <LogoutButton className="w-full sm:w-auto" />
      </CardContent>
    </Card>
  );
}
