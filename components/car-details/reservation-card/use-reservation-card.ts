"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  isBefore,
  isSameDay,
  startOfMonth,
} from "date-fns";
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
  MAX_BOOKING_HORIZON_DAYS,
  MAX_RENTAL_DAYS,
  reservationPreviewSchema,
  type ReservationPreviewInput,
} from "@/lib/validations/reservation.validation";
import type { Car } from "@/types/domain";

import {
  canUseAsPickupDate,
  getOneDayReturnBoundary,
  getRentalDays,
  getRentalRangeError,
} from "./reservation-calendar.utils";
import type { CalendarLoadState } from "./reservation-calendar.types";
import { formatDateOnly, parseDateOnly } from "./reservation-card.utils";

const DESKTOP_CALENDAR_QUERY = "(min-width: 768px)";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getReservationDateError(input: ReservationPreviewInput): string | null {
  const parsed = reservationPreviewSchema.safeParse(input);

  if (parsed.success) return null;

  const fieldErrors = parsed.error.flatten().fieldErrors;

  return (
    fieldErrors.pickupDate?.[0] ??
    fieldErrors.returnDate?.[0] ??
    "Choose a valid pickup and return date range."
  );
}

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
  const latestPickupDate = useMemo(
    () =>
      parseDateOnly(
        addDaysToDateOnly(beirutToday, MAX_BOOKING_HORIZON_DAYS),
      ) ?? new Date(),
    [beirutToday],
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startOfMonth(parseDateOnly(getEarliestPickupDateOnly()) ?? new Date()),
  );
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useReservationRealtime(carId);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBeirutToday(getBeirutDateOnly());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_CALENDAR_QUERY);
    const updateCalendarMode = () => setIsDesktop(mediaQuery.matches);

    updateCalendarMode();
    mediaQuery.addEventListener("change", updateCalendarMode);

    return () => mediaQuery.removeEventListener("change", updateCalendarMode);
  }, []);

  const numberOfMonths = isDesktop ? 2 : 1;
  const unavailableRangesInput = useMemo(() => {
    const from = startOfMonth(displayedMonth);
    const lastVisibleMonth = addMonths(from, numberOfMonths - 1);
    const to = addDays(endOfMonth(lastVisibleMonth), MAX_RENTAL_DAYS);

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
  const allUnavailableRanges = useMemo(
    () => unavailableRanges.map(({ from, to }) => ({ from, to })),
    [unavailableRanges],
  );

  const carIsGenerallyAvailable = status === "available";
  const calendarIsUnavailable =
    unavailableRangesQuery.data === undefined ||
    unavailableRangesQuery.isError ||
    !carIsGenerallyAvailable;
  const loadState: CalendarLoadState =
    unavailableRangesQuery.data !== undefined
      ? { status: "success" }
      : unavailableRangesQuery.isError
        ? {
            status: "error",
            message: unavailableRangesQuery.error.message,
          }
        : { status: "loading" };

  const handleRangeSelect = useCallback(
    (_range: DateRange | undefined, triggerDate: Date) => {
      if (calendarIsUnavailable) {
        setSelectionError("Availability must finish loading before selection.");
        return;
      }

      setSelectionError(null);
      const pickup = selectedRange?.from;

      if (!pickup || selectedRange.to) {
        if (
          !canUseAsPickupDate(
            triggerDate,
            earliestPickupDate,
            latestPickupDate,
            allUnavailableRanges,
          )
        ) {
          setSelectionError("This date is unavailable.");
          return;
        }

        setSelectedRange({ from: triggerDate, to: undefined });
        return;
      }

      if (isBefore(triggerDate, pickup) && !isSameDay(triggerDate, pickup)) {
        if (
          canUseAsPickupDate(
            triggerDate,
            earliestPickupDate,
            latestPickupDate,
            allUnavailableRanges,
          )
        ) {
          setSelectedRange({ from: triggerDate, to: undefined });
        } else {
          setSelectionError("This date is unavailable.");
        }
        return;
      }

      const returnBoundary = isSameDay(triggerDate, pickup)
        ? getOneDayReturnBoundary(pickup)
        : triggerDate;
      const error = getRentalRangeError(
        pickup,
        returnBoundary,
        allUnavailableRanges,
        MAX_RENTAL_DAYS,
      );

      if (error) {
        setSelectionError(error);
        return;
      }

      setSelectedRange({ from: pickup, to: returnBoundary });
    },
    [
      allUnavailableRanges,
      calendarIsUnavailable,
      earliestPickupDate,
      latestPickupDate,
      selectedRange,
    ],
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (calendarIsUnavailable) return true;

      const pickup = selectedRange?.from;

      if (!pickup || selectedRange.to) {
        return !canUseAsPickupDate(
          date,
          earliestPickupDate,
          latestPickupDate,
          allUnavailableRanges,
        );
      }

      if (isBefore(date, pickup) && !isSameDay(date, pickup)) {
        return !canUseAsPickupDate(
          date,
          earliestPickupDate,
          latestPickupDate,
          allUnavailableRanges,
        );
      }

      const returnBoundary = isSameDay(date, pickup)
        ? getOneDayReturnBoundary(pickup)
        : date;

      return (
        getRentalRangeError(
          pickup,
          returnBoundary,
          allUnavailableRanges,
          MAX_RENTAL_DAYS,
        ) !== null
      );
    },
    [
      allUnavailableRanges,
      calendarIsUnavailable,
      earliestPickupDate,
      latestPickupDate,
      selectedRange,
    ],
  );

  const pendingOneDayReturn = selectedRange?.from
    ? getOneDayReturnBoundary(selectedRange.from)
    : null;
  const canDone =
    loadState.status === "success" &&
    selectedRange?.from !== undefined &&
    (selectedRange.to
      ? getRentalRangeError(
          selectedRange.from,
          selectedRange.to,
          allUnavailableRanges,
          MAX_RENTAL_DAYS,
        ) === null
      : pendingOneDayReturn !== null &&
        getRentalRangeError(
          selectedRange.from,
          pendingOneDayReturn,
          allUnavailableRanges,
          MAX_RENTAL_DAYS,
        ) === null);

  const handleDone = useCallback(() => {
    if (!selectedRange?.from || !canDone) return;

    if (!selectedRange.to) {
      setSelectedRange({
        from: selectedRange.from,
        to: getOneDayReturnBoundary(selectedRange.from),
      });
    }

    setSelectionError(null);
    setCalendarOpen(false);
  }, [canDone, selectedRange]);

  const handleClear = useCallback(() => {
    setSelectedRange(undefined);
    setSelectionError(null);
  }, []);

  const rangeAvailabilityError = useMemo(() => {
    if (
      loadState.status !== "success" ||
      !selectedRange?.from ||
      !selectedRange.to
    ) {
      return null;
    }

    return getRentalRangeError(
      selectedRange.from,
      selectedRange.to,
      allUnavailableRanges,
      MAX_RENTAL_DAYS,
    );
  }, [allUnavailableRanges, loadState.status, selectedRange]);

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
  const previewQuery = useReservationPreview(dateError ? null : previewInput);
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

  const availablePreview =
    previewState.status === "success" && previewState.preview.available
      ? previewState.preview
      : null;
  const displayedPricePerDay = availablePreview?.pricePerDay ?? pricePerDay;
  const hasPickupDate = selectedRange?.from !== undefined;
  const hasReturnDate = selectedRange?.to !== undefined;
  const hasCompleteRange = pickupDate !== null && returnDate !== null;

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
    if (!hasPickupDate) return action("open-calendar", "Choose rental dates");
    if (!hasReturnDate) return action("open-calendar", "Finish choosing dates");
    if (previewQuery.isFetching) {
      return action("disabled", "Checking availability…", {
        disabled: true,
        loading: true,
      });
    }
    if (previewState.status === "error") {
      return action("retry-preview", "Try availability check again");
    }
    if (previewState.status === "success" && !previewState.preview.available) {
      return action("open-calendar", "Choose different dates");
    }
    if (
      previewState.status === "success" &&
      previewState.preview.available &&
      previewState.preview.totalPrice !== null
    ) {
      return action(
        "continue",
        `Continue — ${currencyFormatter.format(previewState.preview.totalPrice)} total`,
      );
    }

    return action("disabled", "Checking selected dates…", { disabled: true });
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
        if (!pickupDate || !returnDate || previewQuery.isFetching) return;

        const validationError = getReservationDateError({
          carId,
          pickupDate,
          returnDate,
        });

        if (validationError) {
          setSelectionError(validationError);
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
  const returnBoundaryDates = useMemo(() => {
    if (!selectedRange?.from || selectedRange.to) return [];

    return allUnavailableRanges
      .map((range) => range.from)
      .filter(
        (date) =>
          getRentalRangeError(
            selectedRange.from!,
            date,
            allUnavailableRanges,
            MAX_RENTAL_DAYS,
          ) === null,
      );
  }, [allUnavailableRanges, selectedRange]);
  const calendarSelectedRange = useMemo<DateRange | undefined>(() => {
    if (!selectedRange?.from || !selectedRange.to) return selectedRange;

    return getRentalDays(selectedRange.from, selectedRange.to) === 1
      ? { from: selectedRange.from, to: selectedRange.from }
      : selectedRange;
  }, [selectedRange]);
  const previewSelectionError =
    previewState.status === "success" && !previewState.preview.available
      ? "Your rental cannot include reserved dates."
      : null;

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
      isDesktop,
      selectedRange,
      calendarSelectedRange,
      onRangeSelect: handleRangeSelect,
      earliestPickupDate,
      latestPickupDate,
      loadState,
      onRetryUnavailableRanges: () => {
        void unavailableRangesQuery.refetch();
      },
      isDateDisabled,
      allUnavailableRanges,
      myReservationRanges,
      otherReservationRanges,
      returnBoundaryDates,
      maxRentalDays: MAX_RENTAL_DAYS,
      selectionError:
        selectionError ?? rangeAvailabilityError ?? previewSelectionError,
      onClear: handleClear,
      onDone: handleDone,
      canDone,
    },
  };
}
