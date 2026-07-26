"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  LoaderCircle,
  RotateCw,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateSpan = {
  from: Date;
  to: Date;
};

type CalendarLoadState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type ReservationCalendarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayedMonth: Date;
  onMonthChange: (month: Date) => void;
  numberOfMonths: number;
  selectedRange: DateRange | undefined;
  onRangeSelect: (range: DateRange | undefined) => void;
  earliestPickupDate: Date;
  loadState: CalendarLoadState;
  onRetryUnavailableRanges: () => void;
  calendarIsUnavailable: boolean;
  allUnavailableRanges: DateSpan[];
  myReservationRanges: DateSpan[];
  otherReservationRanges: DateSpan[];
  hasMyReservations: boolean;
  maxRentalDays: number;
};

export function ReservationCalendar({
  open,
  onOpenChange,
  displayedMonth,
  onMonthChange,
  numberOfMonths,
  selectedRange,
  onRangeSelect,
  earliestPickupDate,
  loadState,
  onRetryUnavailableRanges,
  calendarIsUnavailable,
  allUnavailableRanges,
  myReservationRanges,
  otherReservationRanges,
  hasMyReservations,
  maxRentalDays,
}: ReservationCalendarProps) {
  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background">
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex min-w-0 flex-col items-start gap-1 border-r border-border px-4 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              />
            }
          >
            <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Pickup
            </span>
            <span className="truncate text-sm font-semibold text-foreground">
              {selectedRange?.from
                ? format(selectedRange.from, "MMM d, yyyy")
                : "Select date"}
            </span>
          </PopoverTrigger>

          <button
            type="button"
            aria-expanded={open}
            onClick={() => onOpenChange(true)}
            className="flex min-w-0 flex-col items-start gap-1 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Return
            </span>
            <span className="truncate text-sm font-semibold text-foreground">
              {selectedRange?.to
                ? format(selectedRange.to, "MMM d, yyyy")
                : "Select date"}
            </span>
          </button>
        </div>

        <PopoverContent
          side="inline-start"
          align="end"
          className="w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-x-auto rounded-2xl p-0"
        >
          <Calendar
            mode="range"
            month={displayedMonth}
            onMonthChange={onMonthChange}
            numberOfMonths={numberOfMonths}
            pagedNavigation
            selected={selectedRange}
            onSelect={onRangeSelect}
            min={2}
            max={maxRentalDays + 1}
            excludeDisabled
            resetOnSelect
            disabled={
              calendarIsUnavailable
                ? true
                : [
                    { before: earliestPickupDate },
                    ...allUnavailableRanges,
                  ]
            }
            modifiers={{
              pickupTooEarly: { before: earliestPickupDate },
              reserved: otherReservationRanges,
              myReservation: myReservationRanges,
            }}
            modifiersClassNames={{
              pickupTooEarly: [
                "!bg-transparent",
                "!text-muted-foreground/35",
                "!opacity-45",
                "[&>button]:!bg-transparent",
                "[&>button]:!text-muted-foreground/35",
                "[&>button]:!opacity-45",
              ].join(" "),

              reserved: [
                "!bg-amber-500/15",
                "!text-amber-700",
                "!opacity-100",
                "[&>button]:!bg-amber-500/15",
                "[&>button]:!text-amber-700",
                "[&>button]:!font-semibold",
                "[&>button]:!opacity-100",
                "[&>button]:!ring-1",
                "[&>button]:!ring-inset",
                "[&>button]:!ring-amber-500/25",
                "dark:!bg-amber-400/15",
                "dark:!text-amber-300",
                "dark:[&>button]:!bg-amber-400/15",
                "dark:[&>button]:!text-amber-300",
              ].join(" "),

              myReservation: [
                "!bg-violet-500/15",
                "!text-violet-700",
                "!opacity-100",
                "[&>button]:!bg-violet-500/15",
                "[&>button]:!text-violet-700",
                "[&>button]:!font-bold",
                "[&>button]:!opacity-100",
                "[&>button]:!ring-1",
                "[&>button]:!ring-inset",
                "[&>button]:!ring-violet-500/30",
                "dark:!bg-violet-400/15",
                "dark:!text-violet-300",
                "dark:[&>button]:!bg-violet-400/15",
                "dark:[&>button]:!text-violet-300",
              ].join(" "),
            }}
            className="p-4"
          />

          <div className="border-t border-border px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full border border-border bg-background" />
                Available
              </span>

              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-primary" />
                Selected
              </span>

              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500/40 ring-1 ring-amber-500/30" />
                Reserved
              </span>

              {hasMyReservations ? (
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-violet-500/40 ring-1 ring-violet-500/30" />
                  Your reservation
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Pickup starts tomorrow (Beirut time). Select up to{" "}
              {maxRentalDays} rental days.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <div className="mt-3 min-h-8" aria-live="polite">
        {loadState.status === "loading" ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
            Loading unavailable dates…
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <span>{loadState.message}</span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onRetryUnavailableRanges}
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCw className="size-3" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}
