"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
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
import type { Car } from "@/types/domain";

type ReservationCardProps = {
  carId: Car["id"];
  pricePerDay: Car["price_per_day"];
  status: Car["status"];
};

type UnavailableDateRange = {
  from: Date;
  to: Date;
};

type CalendarLoadState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

const DESKTOP_CALENDAR_QUERY = "(min-width: 768px)";
const MAX_RENTAL_DAYS = 30;

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return null;
  }

  return typeof payload.error.message === "string"
    ? payload.error.message
    : null;
}

function parseUnavailableRanges(payload: unknown): UnavailableDateRange[] {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !Array.isArray(payload.data)
  ) {
    throw new Error("The unavailable dates response was invalid.");
  }

  return payload.data.map((value) => {
    if (
      !isRecord(value) ||
      typeof value.startDate !== "string" ||
      typeof value.endDateExclusive !== "string"
    ) {
      throw new Error("The unavailable dates response was invalid.");
    }

    const from = parseDateOnly(value.startDate);
    const endDateExclusive = parseDateOnly(value.endDateExclusive);

    if (!from || !endDateExclusive || endDateExclusive <= from) {
      throw new Error("The unavailable dates response was invalid.");
    }

    return {
      from,
      to: addDays(endDateExclusive, -1),
    };
  });
}

export function ReservationCard({
  carId,
  pricePerDay,
  status,
}: ReservationCardProps) {
  const isAvailable = status === "available";
  const today = useMemo(() => startOfDay(new Date()), []);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [unavailableRanges, setUnavailableRanges] = useState<
    UnavailableDateRange[]
  >([]);
  const [loadState, setLoadState] = useState<CalendarLoadState>({
    status: "loading",
  });
  const [retryAttempt, setRetryAttempt] = useState(0);
  const rangeCache = useRef(new Map<string, UnavailableDateRange[]>());

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_CALENDAR_QUERY);
    const updateNumberOfMonths = () => {
      setNumberOfMonths(mediaQuery.matches ? 2 : 1);
    };

    updateNumberOfMonths();
    mediaQuery.addEventListener("change", updateNumberOfMonths);

    return () => {
      mediaQuery.removeEventListener("change", updateNumberOfMonths);
    };
  }, []);

  useEffect(() => {
    const from = startOfMonth(displayedMonth);
    const to = endOfMonth(addMonths(from, numberOfMonths - 1));
    const cacheKey = `${formatDateOnly(from)}:${formatDateOnly(to)}`;
    const cachedRanges = rangeCache.current.get(cacheKey);

    if (cachedRanges) {
      setUnavailableRanges(
        Array.from(rangeCache.current.values()).flatMap((ranges) => ranges),
      );
      setLoadState({ status: "success" });
      return;
    }

    const controller = new AbortController();
    const searchParams = new URLSearchParams({
      from: formatDateOnly(from),
      to: formatDateOnly(to),
    });

    setLoadState({ status: "loading" });

    async function loadUnavailableRanges() {
      try {
        const response = await fetch(
          `/api/cars/${encodeURIComponent(carId)}/unavailable-ranges?${searchParams.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const payload: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            readErrorMessage(payload) ??
              "Unable to load unavailable dates. Please try again.",
          );
        }

        const ranges = parseUnavailableRanges(payload);
        rangeCache.current.set(cacheKey, ranges);
        setUnavailableRanges(
          Array.from(rangeCache.current.values()).flatMap(
            (cachedValue) => cachedValue,
          ),
        );
        setLoadState({ status: "success" });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load unavailable dates. Please try again.",
        });
      }
    }

    void loadUnavailableRanges();

    return () => {
      controller.abort();
    };
  }, [carId, displayedMonth, numberOfMonths, retryAttempt]);

  const retryUnavailableRanges = useCallback(() => {
    const from = startOfMonth(displayedMonth);
    const to = endOfMonth(addMonths(from, numberOfMonths - 1));
    const cacheKey = `${formatDateOnly(from)}:${formatDateOnly(to)}`;

    rangeCache.current.delete(cacheKey);
    setRetryAttempt((attempt) => attempt + 1);
  }, [displayedMonth, numberOfMonths]);

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    setSelectedRange(range);

    if (range?.from && range.to) {
      setCalendarOpen(false);
    }
  }, []);

  const rentalDays =
    selectedRange?.from && selectedRange.to
      ? differenceInCalendarDays(selectedRange.to, selectedRange.from)
      : null;
  const calendarIsUnavailable =
    !isAvailable || loadState.status !== "success";

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      data-car-id={carId}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">
          ${pricePerDay}
        </span>
        <span className="text-sm font-medium text-muted-foreground">/ day</span>
      </div>

      <div
        className={`mt-5 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
          isAvailable
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {isAvailable ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {isAvailable
            ? "This vehicle is currently available."
            : "This vehicle is currently unavailable."}
        </span>
      </div>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background">
          <PopoverTrigger
            disabled={!isAvailable}
            render={
              <button
                type="button"
                className="flex min-w-0 flex-col items-start gap-1 border-r border-border px-4 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
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
            disabled={!isAvailable}
            aria-expanded={calendarOpen}
            onClick={() => setCalendarOpen(true)}
            className="flex min-w-0 flex-col items-start gap-1 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
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
          align="end"
          className="w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-x-auto rounded-2xl p-0"
        >
          <Calendar
            mode="range"
            month={displayedMonth}
            onMonthChange={setDisplayedMonth}
            numberOfMonths={numberOfMonths}
            pagedNavigation
            selected={selectedRange}
            onSelect={handleRangeSelect}
            min={1}
            max={MAX_RENTAL_DAYS}
            excludeDisabled
            resetOnSelect
            disabled={
              calendarIsUnavailable
                ? true
                : [{ before: today }, ...unavailableRanges]
            }
            className="p-4"
          />
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Select up to {MAX_RENTAL_DAYS} rental days. Unavailable dates are
            disabled.
          </p>
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
              onClick={retryUnavailableRanges}
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCw className="size-3" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : null}
      </div>

      {selectedRange?.from && selectedRange.to && rentalDays !== null ? (
        <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-muted/20 px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Pickup date
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {format(selectedRange.from, "EEE, MMM d, yyyy")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Return date
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {format(selectedRange.to, "EEE, MMM d, yyyy")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Rental days
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {rentalDays} {rentalDays === 1 ? "day" : "days"}
            </dd>
          </div>
        </dl>
      ) : null}

      <button
        type="button"
        disabled
        className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-muted py-3.5 font-semibold text-muted-foreground opacity-70"
      >
        Reservation unavailable
      </button>
    </div>
  );
}
