import {
  addDays,
  format,
} from "date-fns";

import type {
  ReservationPreview,
  ReservationUnavailableReason,
} from "@/lib/server/reservations/preview-reservation";

export type UnavailableDateRange = {
  from: Date;
  to: Date;
  isMine: boolean;
};

export function parseDateOnly(
  value: string,
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

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

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

export function readErrorMessage(
  payload: unknown,
): string | null {
  if (
    !isRecord(payload) ||
    !isRecord(payload.error)
  ) {
    return null;
  }

  return typeof payload.error.message === "string"
    ? payload.error.message
    : null;
}

export function parseUnavailableRanges(
  payload: unknown,
): UnavailableDateRange[] {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !Array.isArray(payload.data)
  ) {
    throw new Error(
      "The unavailable dates response was invalid.",
    );
  }

  return payload.data.map((value) => {
    if (
      !isRecord(value) ||
      typeof value.startDate !== "string" ||
      typeof value.endDateExclusive !== "string" ||
      typeof value.isMine !== "boolean"
    ) {
      throw new Error(
        "The unavailable dates response was invalid.",
      );
    }

    const from = parseDateOnly(value.startDate);
    const endDateExclusive = parseDateOnly(
      value.endDateExclusive,
    );

    if (
      !from ||
      !endDateExclusive ||
      endDateExclusive <= from
    ) {
      throw new Error(
        "The unavailable dates response was invalid.",
      );
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

export function parseReservationPreview(
  payload: unknown,
): ReservationPreview {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !isRecord(payload.data)
  ) {
    throw new Error(
      "The reservation preview response was invalid.",
    );
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
    (typeof data.pricePerDay !== "number" &&
      data.pricePerDay !== null) ||
    (typeof data.totalPrice !== "number" &&
      data.totalPrice !== null) ||
    !isUnavailableReason(
      data.unavailableReason,
    ) ||
    !parseDateOnly(data.pickupDate) ||
    !parseDateOnly(data.returnDate)
  ) {
    throw new Error(
      "The reservation preview response was invalid.",
    );
  }

  if (
    data.available &&
    (data.pricePerDay === null ||
      data.totalPrice === null)
  ) {
    throw new Error(
      "The reservation preview response was invalid.",
    );
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

export function formatPreviewDate(
  value: string,
): string {
  const date = parseDateOnly(value);

  return date
    ? format(date, "EEE, MMM d, yyyy")
    : value;
}

export function getUnavailableMessage(
  reason: ReservationUnavailableReason,
): string {
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
