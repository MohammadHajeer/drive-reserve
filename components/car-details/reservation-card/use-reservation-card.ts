"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";

import { useCarUnavailableRanges } from "@/features/reservations/hooks/use-car-unavailable-ranges";
import { useReservationPreview } from "@/features/reservations/hooks/use-reservation-preview";
import { useReservationRealtime } from "@/features/reservations/hooks/use-reservation-realtime";
import type { ReservationPreview } from "@/features/reservations/reservation.types";
import {
  addDaysToDateOnly,
  getBeirutDateOnly,
  getEarliestPickupDateOnly,
} from "@/lib/reservations/reservation-date";
import {
  MAX_RENTAL_DAYS,
  reservationPreviewSchema,
  type ReservationPreviewInput,
} from "@/lib/validations/reservation.validation";
import type { Car } from "@/types/domain";

import { formatDateOnly, parseDateOnly } from "./reservation-card.utils";

const DESKTOP_CALENDAR_QUERY = "(min-width: 768px)";

function getReservationDateError(input: ReservationPreviewInput): string | null {
  const parsed = reservationPreviewSchema.safeParse(input);

  if (parsed.success) {
    return null;
  }

  const fieldErrors = parsed.error.flatten().fieldErrors;

  return (
    fieldErrors.pickupDate?.[0] ??
    fieldErrors.returnDate?.[0] ??
    "Choose a valid pickup and return date range."
  );
}

export { MAX_RENTAL_DAYS } from "@/lib/validations/reservation.validation";

type CalendarLoadState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; preview: ReservationPreview }
  | { status: "error"; message: string };

type PrimaryActionKind =
  | "open-calendar"
  | "retry-preview"
  | "continue"
  | "disabled";

type UseReservationCardInput = {
  carId: Car["id"];
  pricePerDay: Car["price_per_day"];
  status: Car["status"];
};

export function useReservationCard({
  carId,
  pricePerDay,
  status,
}: UseReservationCardInput) {
  const router = useRouter();
  const [beirutToday, setBeirutToday] = useState(getBeirutDateOnly);
  const earliestPickupDate = useMemo(
    () => parseDateOnly(addDaysToDateOnly(beirutToday, 1)) ?? new Date(),
    [beirutToday],
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startOfMonth(parseDateOnly(getEarliestPickupDateOnly()) ?? new Date()),
  );
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [selectedRange, setSelectedRange] = useState<DateRange>();

  useReservationRealtime(carId);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBeirutToday(getBeirutDateOnly());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

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

  const unavailableRangesInput = useMemo(() => {
    const from = startOfMonth(displayedMonth);
    const to = endOfMonth(addMonths(from, numberOfMonths - 1));

    return {
      carId,
      from: formatDateOnly(from),
      to: formatDateOnly(to),
    };
  }, [carId, displayedMonth, numberOfMonths]);
  const unavailableRangesQuery = useCarUnavailableRanges(
    unavailableRangesInput,
  );
  const unavailableRanges = useMemo(
    () => unavailableRangesQuery.data ?? [],
    [unavailableRangesQuery.data],
  );

  const loadState: CalendarLoadState = unavailableRangesQuery.data
    ? { status: "success" }
    : unavailableRangesQuery.isError
      ? {
          status: "error",
          message: unavailableRangesQuery.error.message,
        }
      : { status: "loading" };

  const pickupDate = selectedRange?.from
    ? formatDateOnly(selectedRange.from)
    : null;
  const returnDate = selectedRange?.to
    ? formatDateOnly(selectedRange.to)
    : null;
  const previewInput = useMemo<ReservationPreviewInput | null>(
    () =>
      pickupDate && returnDate
        ? { carId, pickupDate, returnDate }
        : null,
    [carId, pickupDate, returnDate],
  );
  const dateError = previewInput
    ? getReservationDateError(previewInput)
    : null;
  const previewQuery = useReservationPreview(
    dateError ? null : previewInput,
  );
  const refetchReservationPreview = previewQuery.refetch;

  const previewState = useMemo<PreviewState>(
    () =>
      !previewInput
        ? { status: "idle" }
        : dateError
          ? { status: "error", message: dateError }
          : previewQuery.data
            ? { status: "success", preview: previewQuery.data }
            : previewQuery.isError
              ? { status: "error", message: previewQuery.error.message }
              : { status: "loading" },
    [
      dateError,
      previewInput,
      previewQuery.data,
      previewQuery.error,
      previewQuery.isError,
    ],
  );

  const retryReservationPreview = useCallback(() => {
    void refetchReservationPreview();
  }, [refetchReservationPreview]);

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    setSelectedRange(range);

    if (range?.from && range.to) {
      setCalendarOpen(false);
    }
  }, []);

  const availablePreview =
    previewState.status === "success" && previewState.preview.available
      ? previewState.preview
      : null;
  const displayedPricePerDay = availablePreview?.pricePerDay ?? pricePerDay;
  const hasPickupDate = selectedRange?.from !== undefined;
  const hasReturnDate = selectedRange?.to !== undefined;
  const hasCompleteRange = pickupDate !== null && returnDate !== null;
  const carIsGenerallyAvailable = status === "available";

  const primaryAction = useMemo(() => {
    const action = (
      kind: PrimaryActionKind,
      label: string,
      options: { disabled?: boolean; loading?: boolean } = {},
    ) => ({
      kind,
      label,
      disabled: options.disabled ?? false,
      loading: options.loading ?? false,
    });

    if (!carIsGenerallyAvailable) {
      return action("disabled", "This car is currently unavailable", {
        disabled: true,
      });
    }

    if (!hasPickupDate) {
      return action("open-calendar", "Choose rental dates");
    }

    if (!hasReturnDate) {
      return action("open-calendar", "Select a return date");
    }

    if (previewQuery.isFetching) {
      return action("disabled", "Checking availability…", {
        disabled: true,
        loading: true,
      });
    }

    if (previewState.status === "error") {
      return action("retry-preview", "Try availability check again");
    }

    if (
      previewState.status === "success" &&
      !previewState.preview.available
    ) {
      return action("open-calendar", "Choose different dates");
    }

    if (
      previewState.status === "success" &&
      previewState.preview.available
    ) {
      return action("continue", "Continue to confirmation");
    }

    return action("disabled", "Checking selected dates…", {
      disabled: true,
    });
  }, [
    carIsGenerallyAvailable,
    hasPickupDate,
    hasReturnDate,
    previewQuery.isFetching,
    previewState,
  ]);

  const handlePrimaryAction = useCallback(async () => {
    switch (primaryAction.kind) {
      case "open-calendar":
        setCalendarOpen(true);
        return;

      case "retry-preview":
        retryReservationPreview();
        return;

      case "continue": {
        if (!pickupDate || !returnDate || previewQuery.isFetching) {
          return;
        }

        const validationError = getReservationDateError({
          carId,
          pickupDate,
          returnDate,
        });

        if (validationError) {
          setCalendarOpen(true);
          return;
        }

        const searchParams = new URLSearchParams({
          pickup: pickupDate,
          return: returnDate,
        });
        router.push(
          `/cars/${encodeURIComponent(carId)}/confirm-reservation?${searchParams.toString()}`,
        );
        return;
      }

      case "disabled":
        return;
    }
  }, [
    carId,
    pickupDate,
    previewQuery.isFetching,
    primaryAction.kind,
    retryReservationPreview,
    returnDate,
    router,
  ]);

  const allUnavailableRanges = useMemo(
    () => unavailableRanges.map(({ from, to }) => ({ from, to })),
    [unavailableRanges],
  );
  const myReservationRanges = useMemo(
    () =>
      unavailableRanges
        .filter((range) => range.isMine && range.to >= earliestPickupDate)
        .map((range) => ({
          from: range.from < earliestPickupDate ? earliestPickupDate : range.from,
          to: range.to,
        })),
    [earliestPickupDate, unavailableRanges],
  );
  const otherReservationRanges = useMemo(
    () =>
      unavailableRanges
        .filter((range) => !range.isMine && range.to >= earliestPickupDate)
        .map((range) => ({
          from: range.from < earliestPickupDate ? earliestPickupDate : range.from,
          to: range.to,
        })),
    [earliestPickupDate, unavailableRanges],
  );

  return {
    hasCompleteRange,
    previewState,
    availablePreview,
    displayedPricePerDay,
    primaryAction,
    handlePrimaryAction,
    retryReservationPreview,
    calendar: {
      open: calendarOpen,
      onOpenChange: setCalendarOpen,
      displayedMonth,
      onMonthChange: setDisplayedMonth,
      numberOfMonths,
      selectedRange,
      onRangeSelect: handleRangeSelect,
      earliestPickupDate,
      loadState,
      onRetryUnavailableRanges: () => {
        void unavailableRangesQuery.refetch();
      },
      calendarIsUnavailable:
        unavailableRangesQuery.data === undefined ||
        unavailableRangesQuery.isError ||
        !carIsGenerallyAvailable,
      allUnavailableRanges,
      myReservationRanges,
      otherReservationRanges,
      hasMyReservations: myReservationRanges.length > 0,
      maxRentalDays: MAX_RENTAL_DAYS,
    },
  };
}
