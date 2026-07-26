"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addMonths,
  endOfMonth,
  startOfMonth,
} from "date-fns";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";

import type { ReservationPreview } from "@/lib/server/reservations/preview-reservation";
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

import {
  formatDateOnly,
  parseDateOnly,
  parseReservationPreview,
  parseUnavailableRanges,
  readErrorMessage,
  type UnavailableDateRange,
} from "./reservation-card.utils";

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
    () =>
      parseDateOnly(addDaysToDateOnly(beirutToday, 1)) ??
      new Date(),
    [beirutToday],
  );

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startOfMonth(
      parseDateOnly(getEarliestPickupDateOnly()) ?? new Date(),
    ),
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

  const rangeCache = useRef(
    new Map<string, UnavailableDateRange[]>(),
  );
  const previewAbortController = useRef<AbortController | null>(null);

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

  useEffect(() => {
    const from = startOfMonth(displayedMonth);
    const to = endOfMonth(addMonths(from, numberOfMonths - 1));
    const cacheKey = [
      carId,
      formatDateOnly(from),
      formatDateOnly(to),
    ].join(":");
    const cachedRanges = rangeCache.current.get(cacheKey);

    if (cachedRanges) {
      setUnavailableRanges(
        Array.from(rangeCache.current.entries())
          .filter(([key]) => key.startsWith(`${carId}:`))
          .flatMap(([, ranges]) => ranges),
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
          `/api/cars/${encodeURIComponent(
            carId,
          )}/unavailable-ranges?${searchParams.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            `Unable to load unavailable dates. The API route was not found or returned an invalid response (${response.status}).`,
          );
        }

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
          Array.from(rangeCache.current.entries())
            .filter(([key]) => key.startsWith(`${carId}:`))
            .flatMap(([, cachedValue]) => cachedValue),
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
  }, [
    carId,
    displayedMonth,
    numberOfMonths,
    retryAttempt,
  ]);

  const retryUnavailableRanges = useCallback(() => {
    const from = startOfMonth(displayedMonth);
    const to = endOfMonth(addMonths(from, numberOfMonths - 1));
    const cacheKey = [
      carId,
      formatDateOnly(from),
      formatDateOnly(to),
    ].join(":");

    rangeCache.current.delete(cacheKey);
    setRetryAttempt((attempt) => attempt + 1);
  }, [carId, displayedMonth, numberOfMonths]);

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

    const requestBody = {
      carId,
      pickupDate,
      returnDate,
    } satisfies ReservationPreviewInput;
    const dateError = getReservationDateError(requestBody);

    if (dateError) {
      const timeout = window.setTimeout(() => {
        setPreviewState({ status: "error", message: dateError });
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    const controller = new AbortController();
    previewAbortController.current = controller;

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

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            `Unable to check availability. Server returned invalid response (${response.status}).`,
          );
        }

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
          throw new Error(
            "The reservation preview response was invalid.",
          );
        }

        if (!controller.signal.aborted) {
          setPreviewState({
            status: "success",
            preview,
          });
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
  }, [
    beirutToday,
    carId,
    pickupDate,
    previewRetryAttempt,
    returnDate,
  ]);

  const retryReservationPreview = useCallback(() => {
    previewAbortController.current?.abort();
    setPreviewState({ status: "loading" });
    setPreviewRetryAttempt((attempt) => attempt + 1);
  }, []);

  const handleRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      previewAbortController.current?.abort();
      setPreviewState(
        range?.from && range.to
          ? { status: "loading" }
          : { status: "idle" },
      );
      setSelectedRange(range);

      if (range?.from && range.to) {
        setCalendarOpen(false);
      }
    },
    [],
  );

  const availablePreview =
    previewState.status === "success" &&
    previewState.preview.available
      ? previewState.preview
      : null;

  const displayedPricePerDay =
    availablePreview?.pricePerDay ?? pricePerDay;

  const hasPickupDate = selectedRange?.from !== undefined;
  const hasReturnDate = selectedRange?.to !== undefined;
  const hasCompleteRange = pickupDate !== null && returnDate !== null;
  const carIsGenerallyAvailable = status === "available";

  const primaryAction = useMemo(() => {
    const action = (
      kind: PrimaryActionKind,
      label: string,
      options: {
        disabled?: boolean;
        loading?: boolean;
      } = {},
    ) => ({
      kind,
      label,
      disabled: options.disabled ?? false,
      loading: options.loading ?? false,
    });

    if (!carIsGenerallyAvailable) {
      return action(
        "disabled",
        "This car is currently unavailable",
        { disabled: true },
      );
    }

    if (!hasPickupDate) {
      return action("open-calendar", "Choose rental dates");
    }

    if (!hasReturnDate) {
      return action("open-calendar", "Select a return date");
    }

    if (previewState.status === "loading") {
      return action(
        "disabled",
        "Checking availability…",
        {
          disabled: true,
          loading: true,
        },
      );
    }

    if (previewState.status === "error") {
      return action(
        "retry-preview",
        "Try availability check again",
      );
    }

    if (
      previewState.status === "success" &&
      !previewState.preview.available
    ) {
      return action(
        "open-calendar",
        "Choose different dates",
      );
    }

    if (
      previewState.status === "success" &&
      previewState.preview.available
    ) {
      return action(
        "continue",
        "Continue to confirmation",
      );
    }

    return action(
      "disabled",
      "Checking selected dates…",
      { disabled: true },
    );
  }, [
    carIsGenerallyAvailable,
    hasPickupDate,
    hasReturnDate,
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
        if (!pickupDate || !returnDate) {
          return;
        }

        const dateError = getReservationDateError({
          carId,
          pickupDate,
          returnDate,
        });

        if (dateError) {
          setPreviewState({ status: "error", message: dateError });
          setCalendarOpen(true);
          return;
        }

        const searchParams = new URLSearchParams({
          pickup: pickupDate,
          return: returnDate,
        });

        const targetUrl = `/cars/${encodeURIComponent(
          carId,
        )}/confirm-reservation?${searchParams.toString()}`;

        router.push(targetUrl);
        return;
      }

      case "disabled":
        return;
    }
  }, [
    carId,
    pickupDate,
    primaryAction.kind,
    retryReservationPreview,
    returnDate,
    router,
  ]);

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
        .filter(
          (range) =>
            range.isMine && range.to >= earliestPickupDate,
        )
        .map((range) => ({
          from:
            range.from < earliestPickupDate
              ? earliestPickupDate
              : range.from,
          to: range.to,
        })),
    [earliestPickupDate, unavailableRanges],
  );

  const otherReservationRanges = useMemo(
    () =>
      unavailableRanges
        .filter(
          (range) =>
            !range.isMine && range.to >= earliestPickupDate,
        )
        .map((range) => ({
          from:
            range.from < earliestPickupDate
              ? earliestPickupDate
              : range.from,
          to: range.to,
        })),
    [earliestPickupDate, unavailableRanges],
  );

  const hasMyReservations =
    myReservationRanges.length > 0;

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
      onRetryUnavailableRanges:
        retryUnavailableRanges,
      calendarIsUnavailable:
        loadState.status !== "success" ||
        !carIsGenerallyAvailable,
      allUnavailableRanges,
      myReservationRanges,
      otherReservationRanges,
      hasMyReservations,
      maxRentalDays: MAX_RENTAL_DAYS,
    },
  };
}
