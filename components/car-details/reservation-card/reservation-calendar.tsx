"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

import { DesktopRentalCalendarPopover } from "./desktop-rental-calendar-popover";
import { MobileRentalCalendarDrawer } from "./mobile-rental-calendar-drawer";
import type { RentalCalendarProps } from "./reservation-calendar.types";

function RentalDateFields({
  pickup,
  returnBoundary,
  open,
}: {
  pickup: Date | undefined;
  returnBoundary: Date | undefined;
  open: boolean;
}) {
  return (
    <span
      className={cn(
        "mt-6 grid w-full cursor-pointer grid-cols-2 overflow-hidden rounded-xl border border-border bg-background text-left outline-none transition-colors",
        "hover:border-primary/35 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        open && "border-primary/40 ring-3 ring-primary/10",
      )}
      aria-label="Choose pickup and return dates"
    >
      <span className="flex min-w-0 flex-col items-start gap-1 border-r border-border px-4 py-3">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Pickup
        </span>
        <span className="truncate text-sm font-semibold text-foreground">
          {pickup ? format(pickup, "d MMM yyyy") : "Select date"}
        </span>
      </span>

      <span className="flex min-w-0 flex-col items-start gap-1 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Return
        </span>
        <span className="truncate text-sm font-semibold text-foreground">
          {returnBoundary
            ? format(returnBoundary, "d MMM yyyy")
            : pickup
              ? "Select return"
              : "Select date"}
        </span>
      </span>
    </span>
  );
}
export function ReservationCalendar(props: RentalCalendarProps) {
  const trigger = (
    <RentalDateFields
      pickup={props.selectedRange?.from}
      returnBoundary={props.selectedRange?.to}
      open={props.open}
    />
  );

  return props.isDesktop ? (
    <DesktopRentalCalendarPopover {...props} trigger={trigger} />
  ) : (
    <MobileRentalCalendarDrawer {...props} trigger={trigger} />
  );
}
