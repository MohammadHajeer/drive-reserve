"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
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
import type {
  ReservationPreview,
  ReservationUnavailableReason,
} from "@/lib/server/reservations/preview-reservation";
import type { ReservationPreviewInput } from "@/lib/validations/reservation.validation";
import type { Car } from "@/types/domain";

type ReservationCardProps = {
  carId: Car["id"];
  pricePerDay: Car["price_per_day"];
  status: Car["status"];
};

type UnavailableDateRange = {
  from: Date;
  to: Date;
  isMine: boolean;
};

type CalendarLoadState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; preview: ReservationPreview }
  | { status: "error"; message: string };

const DESKTOP_CALENDAR_QUERY = "(min-width: 768px)";
const MAX_RENTAL_DAYS = 30;
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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
      typeof value.endDateExclusive !== "string" ||
      typeof value.isMine !== "boolean"
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
      isMine: value.isMine,
    };
  });
}

function isUnavailableReason(
  value: unknown,
): value is ReservationUnavailableReason {
  return (
    value === null ||
    value === "CAR_NOT_FOUND" ||
    value === "CAR_NOT_AVAILABLE" ||
    value === "DATES_UNAVAILABLE"
  );
}

function parseReservationPreview(payload: unknown): ReservationPreview {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !isRecord(payload.data)
  ) {
    throw new Error("The reservation preview response was invalid.");
  }

  const data = payload.data;

  if (
    typeof data.carId !== "string" ||
    typeof data.pickupDate !== "string" ||
    typeof data.returnDate !== "string" ||
    typeof data.rentalDays !== "number" ||
    !Number.isInteger(data.rentalDays) ||
    data.rentalDays < 1 ||
    typeof data.available !== "boolean" ||
    (typeof data.pricePerDay !== "number" && data.pricePerDay !== null) ||
    (typeof data.totalPrice !== "number" && data.totalPrice !== null) ||
    !isUnavailableReason(data.unavailableReason) ||
    !parseDateOnly(data.pickupDate) ||
    !parseDateOnly(data.returnDate)
  ) {
    throw new Error("The reservation preview response was invalid.");
  }

  if (
    data.available &&
    (data.pricePerDay === null || data.totalPrice === null)
  ) {
    throw new Error("The reservation preview response was invalid.");
  }

  return {
    carId: data.carId,
    pickupDate: data.pickupDate,
    returnDate: data.returnDate,
    rentalDays: data.rentalDays,
    available: data.available,
    pricePerDay: data.pricePerDay,
    totalPrice: data.totalPrice,
    unavailableReason: data.unavailableReason,
  };
}

function formatPreviewDate(value: string): string {
  const date = parseDateOnly(value);

  if (!date) {
    return value;
  }

  return format(date, "EEE, MMM d, yyyy");
}

function getUnavailableMessage(reason: ReservationUnavailableReason): string {
  switch (reason) {
    case "CAR_NOT_AVAILABLE":
      return "This car is currently unavailable for reservations.";
    case "DATES_UNAVAILABLE":
      return "Those dates are no longer available. Please choose another range.";
    case "CAR_NOT_FOUND":
      return "This car could not be found.";
    case null:
      return "This car is unavailable for the selected dates.";
  }
}

export function ReservationCard({ carId, pricePerDay }: ReservationCardProps) {
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
  const [previewState, setPreviewState] = useState<PreviewState>({
    status: "idle",
  });
  const [previewRetryAttempt, setPreviewRetryAttempt] = useState(0);
  const rangeCache = useRef(new Map<string, UnavailableDateRange[]>());
  const previewAbortController = useRef<AbortController | null>(null);

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

  const pickupDate = selectedRange?.from
    ? formatDateOnly(selectedRange.from)
    : null;
  const returnDate = selectedRange?.to
    ? formatDateOnly(selectedRange.to)
    : null;

  useEffect(() => {
    previewAbortController.current?.abort();

    if (!pickupDate || !returnDate) {
      return;
    }

    const controller = new AbortController();
    previewAbortController.current = controller;
    const requestBody = {
      carId,
      pickupDate,
      returnDate,
    } satisfies ReservationPreviewInput;

    async function loadReservationPreview() {
      try {
        const response = await fetch("/api/reservations/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          cache: "no-store",
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            readErrorMessage(payload) ??
              "Unable to check availability at the moment. Please try again.",
          );
        }

        const preview = parseReservationPreview(payload);

        if (
          preview.carId !== carId ||
          preview.pickupDate !== pickupDate ||
          preview.returnDate !== returnDate
        ) {
          throw new Error("The reservation preview response was invalid.");
        }

        if (!controller.signal.aborted) {
          setPreviewState({ status: "success", preview });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setPreviewState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to check availability at the moment. Please try again.",
        });
      }
    }

    void loadReservationPreview();

    return () => {
      controller.abort();

      if (previewAbortController.current === controller) {
        previewAbortController.current = null;
      }
    };
  }, [carId, pickupDate, previewRetryAttempt, returnDate]);

  const retryReservationPreview = useCallback(() => {
    previewAbortController.current?.abort();
    setPreviewState({ status: "loading" });
    setPreviewRetryAttempt((attempt) => attempt + 1);
  }, []);

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    previewAbortController.current?.abort();
    setPreviewState(
      range?.from && range.to ? { status: "loading" } : { status: "idle" },
    );
    setSelectedRange(range);

    if (range?.from && range.to) {
      setCalendarOpen(false);
    }
  }, []);

  const hasCompleteRange = pickupDate !== null && returnDate !== null;
  const availablePreview =
    previewState.status === "success" && previewState.preview.available
      ? previewState.preview
      : null;
  const displayedPricePerDay = availablePreview?.pricePerDay ?? pricePerDay;
  const canReserve = availablePreview !== null;
  const calendarIsUnavailable = loadState.status !== "success";

  const allUnavailableRanges = useMemo(
    () =>
      unavailableRanges.map(({ from, to }) => ({
        from,
        to,
      })),
    [unavailableRanges],
  );

  const myReservationRanges = useMemo(
    () =>
      unavailableRanges
        .filter((range) => range.isMine && range.to >= today)
        .map((range) => ({
          // Keep dates before today gray, even when they belong
          // to an ongoing reservation.
          from: range.from < today ? today : range.from,
          to: range.to,
        })),
    [today, unavailableRanges],
  );

  const otherReservationRanges = useMemo(
    () =>
      unavailableRanges
        .filter((range) => !range.isMine && range.to >= today)
        .map((range) => ({
          from: range.from < today ? today : range.from,
          to: range.to,
        })),
    [today, unavailableRanges],
  );

  const hasMyReservations = myReservationRanges.length > 0;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      data-car-id={carId}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">
          {currencyFormatter.format(displayedPricePerDay)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">/ day</span>
      </div>

      {!hasCompleteRange ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Select your rental dates to check availability.</span>
        </div>
      ) : null}

      {hasCompleteRange && previewState.status === "loading" ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
          <LoaderCircle
            className="h-4 w-4 shrink-0 animate-spin"
            aria-hidden="true"
          />
          <span>Checking availability and calculating price...</span>
        </div>
      ) : null}

      {hasCompleteRange &&
      previewState.status === "success" &&
      previewState.preview.available ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>The car is available for the selected dates.</span>
        </div>
      ) : null}

      {hasCompleteRange &&
      previewState.status === "success" &&
      !previewState.preview.available ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {getUnavailableMessage(previewState.preview.unavailableReason)}
          </span>
        </div>
      ) : null}

      {hasCompleteRange && previewState.status === "error" ? (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          <span>{previewState.message}</span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={retryReservationPreview}
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCw className="size-3" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : null}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background">
          <PopoverTrigger
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
                : [{ before: today }, ...allUnavailableRanges]
            }
            modifiers={{
              past: { before: today },
              reserved: otherReservationRanges,
              myReservation: myReservationRanges,
            }}
            modifiersClassNames={{
              past: [
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
              Select up to {MAX_RENTAL_DAYS} rental days.
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
              onClick={retryUnavailableRanges}
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCw className="size-3" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : null}
      </div>

      {availablePreview &&
      availablePreview.pricePerDay !== null &&
      availablePreview.totalPrice !== null ? (
        <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-muted/20 px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Pickup date
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {formatPreviewDate(availablePreview.pickupDate)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Return date
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {formatPreviewDate(availablePreview.returnDate)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Rental days
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {availablePreview.rentalDays}{" "}
              {availablePreview.rentalDays === 1 ? "day" : "days"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Price per day
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {currencyFormatter.format(availablePreview.pricePerDay)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold text-foreground">Total</dt>
            <dd className="text-lg font-bold text-foreground">
              {currencyFormatter.format(availablePreview.totalPrice)}
            </dd>
          </div>
        </dl>
      ) : null}

      <button
        type="button"
        disabled={!canReserve}
        className={`mt-6 flex w-full items-center justify-center rounded-xl py-3.5 font-semibold transition-colors ${
          canReserve
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground opacity-70"
        }`}
      >
        {canReserve ? "Reserve this car" : "Reservation unavailable"}
      </button>
    </div>
  );
}
