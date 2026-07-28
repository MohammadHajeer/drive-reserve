"use client";

import { addDays, format } from "date-fns";
import { LoaderCircle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { getRentalDays } from "./reservation-calendar.utils";
import type { RentalCalendarContentProps } from "./reservation-calendar.types";

function formatSelectionSummary(
  from: Date | undefined,
  to: Date | undefined,
): string {
  if (!from) return "No dates selected";
  if (!to) return `${format(from, "d MMM")} · Done selects 1 day`;

  const rentalDays = getRentalDays(from, to);
  if (rentalDays === 1) return `${format(from, "d MMM")} · 1 day`;

  const dateLabel =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth()
      ? `${format(from, "d")}–${format(to, "d MMM")}`
      : `${format(from, "d MMM")}–${format(to, "d MMM")}`;

  return `${dateLabel} · ${rentalDays} ${rentalDays === 1 ? "day" : "days"}`;
}

function getContextMessage(
  selectedRange: RentalCalendarContentProps["selectedRange"],
  selectionError: string | null,
  maxRentalDays: number,
) {
  if (selectionError) {
    return { title: selectionError, description: null, isError: true };
  }

  if (!selectedRange?.from) {
    return {
      title: "Select your pickup date",
      description: "Pickup starts tomorrow, Beirut time.",
      isError: false,
    };
  }

  if (!selectedRange.to) {
    return {
      title: "Select your return date",
      description: `Choose up to ${maxRentalDays} rental days, or select pickup again for one day.`,
      isError: false,
    };
  }

  const rentalDays = getRentalDays(selectedRange.from, selectedRange.to);

  return {
    title: `${rentalDays} rental ${rentalDays === 1 ? "day" : "days"} selected`,
    description:
      rentalDays === 1
        ? format(selectedRange.from, "d MMMM yyyy")
        : `${format(selectedRange.from, "d MMMM")} – ${format(selectedRange.to, "d MMMM yyyy")}`,
    isError: false,
  };
}

export function RentalCalendarContent({
  variant,
  closeControl,
  displayedMonth,
  onMonthChange,
  selectedRange,
  calendarSelectedRange,
  onRangeSelect,
  earliestPickupDate,
  latestPickupDate,
  loadState,
  onRetryUnavailableRanges,
  isDateDisabled,
  myReservationRanges,
  otherReservationRanges,
  returnBoundaryDates,
  maxRentalDays,
  selectionError,
  onClear,
  onDone,
  canDone,
}: RentalCalendarContentProps) {
  const contextMessage = getContextMessage(
    selectedRange,
    selectionError,
    maxRentalDays,
  );
  const isMobile = variant === "mobile";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header
        className={cn(
          "sticky top-0 z-20 shrink-0 border-b border-border/70 bg-popover",
          isMobile ? "px-4 pb-3 pt-2" : "px-5 py-3.5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0" aria-live="polite" aria-atomic="true">
            {isMobile ? (
              <p className="mb-1 text-sm font-semibold text-foreground">
                Choose rental dates
              </p>
            ) : null}
            <p
              className={cn(
                "text-sm font-semibold",
                contextMessage.isError ? "text-destructive" : "text-foreground",
              )}
            >
              {contextMessage.title}
            </p>
            {contextMessage.description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {contextMessage.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {loadState.status === "loading" ? (
              <LoaderCircle
                className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none"
                aria-label="Loading unavailable dates"
              />
            ) : null}
            {closeControl}
          </div>
        </div>

        {loadState.status === "error" ? (
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-destructive">
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
      </header>

      <div className={cn("min-h-0", isMobile && "overflow-y-auto overscroll-contain")}>
        <Calendar
          mode="range"
          month={displayedMonth}
          onMonthChange={onMonthChange}
          numberOfMonths={isMobile ? 1 : 2}
          pagedNavigation={!isMobile}
          selected={calendarSelectedRange}
          onSelect={(range, triggerDate) => onRangeSelect(range, triggerDate)}
          excludeDisabled
          disabled={isDateDisabled}
          startMonth={new Date(
            earliestPickupDate.getFullYear(),
            earliestPickupDate.getMonth(),
            1,
          )}
          endMonth={new Date(
            addDays(latestPickupDate, maxRentalDays).getFullYear(),
            addDays(latestPickupDate, maxRentalDays).getMonth(),
            1,
          )}
          showOutsideDays={false}
          modifiers={{
            reserved: otherReservationRanges,
            myReservation: myReservationRanges,
            returnBoundary: returnBoundaryDates,
          }}
          modifiersClassNames={{
            reserved: [
              "!bg-amber-500/10 !text-amber-800 !opacity-100",
              "[&>button]:!bg-amber-500/10 [&>button]:!text-amber-800",
              "[&>button]:!opacity-100 [&>button]:!ring-1 [&>button]:!ring-inset",
              "[&>button]:!ring-amber-500/20 dark:!text-amber-300",
              "dark:[&>button]:!text-amber-300 dark:[&>button]:!ring-amber-400/25",
            ].join(" "),
            myReservation: [
              "!bg-amber-500/10 !text-amber-800 !opacity-100",
              "[&>button]:!bg-amber-500/10 [&>button]:!text-amber-800",
              "[&>button]:!opacity-100 [&>button]:!ring-1 [&>button]:!ring-inset",
              "[&>button]:!ring-amber-500/20 dark:!text-amber-300",
              "dark:[&>button]:!text-amber-300 dark:[&>button]:!ring-amber-400/25",
            ].join(" "),
            returnBoundary:
              "[&>button]:!ring-2 [&>button]:!ring-primary/45 [&>button]:!ring-inset",
          }}
          classNames={{
            months: cn(
              "relative flex flex-col md:flex-row",
              isMobile ? "gap-4" : "gap-7",
            ),
            month: "flex w-full flex-col gap-3",
            month_caption:
              "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
            caption_label: "text-sm font-semibold text-foreground",
            weekday:
              "flex-1 rounded-lg text-[0.72rem] font-semibold uppercase text-muted-foreground/90 select-none",
            week: "mt-1.5 flex w-full",
            range_start:
              "relative rounded-l-lg bg-primary/15 after:absolute after:inset-y-0 after:right-0 after:w-1/2 after:bg-primary/15 [&:has(button[data-range-end=true])]:after:hidden",
            range_middle:
              "rounded-none bg-primary/15 [&>button]:!bg-primary/15 [&>button]:!text-primary",
            range_end:
              "relative rounded-r-lg bg-primary/15 after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:bg-primary/15 [&:has(button[data-range-start=true])]:after:hidden",
            today:
              "[&>button]:ring-1 [&>button]:ring-primary/50 [&>button]:ring-inset",
            disabled:
              "!text-muted-foreground !opacity-100 [&>button]:!text-muted-foreground/70 [&>button]:!opacity-100 dark:[&>button]:!text-muted-foreground/80",
            outside: "invisible",
          }}
          className={cn(
            "mx-auto w-full bg-transparent p-4",
            isMobile
              ? "max-w-[22rem] [--cell-size:2.625rem]"
              : "[--cell-size:2.5rem] px-5 py-4",
          )}
        />
      </div>

      <footer
        className={cn(
          "sticky bottom-0 z-20 mt-auto shrink-0 border-t border-border/70 bg-popover",
          isMobile ? "px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "px-5 py-3",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p
              className="truncate text-xs font-semibold text-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatSelectionSummary(selectedRange?.from, selectedRange?.to)}
            </p>
            {!isMobile ? (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-amber-500/40 ring-1 ring-amber-500/30" />
                Reserved
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClear}
              disabled={!selectedRange?.from}
              className={cn(isMobile && "h-11 px-4")}
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={onDone}
              disabled={!canDone}
              className={cn(isMobile && "h-11 min-w-24 px-5")}
            >
              Done
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
