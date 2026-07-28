import { addDays } from "date-fns";

import {
  dateDifferenceInDays,
  formatDateOnly,
} from "@/lib/reservations/reservation-date";

export type CalendarDateSpan = {
  from: Date;
  to: Date;
};

function compareDateOnly(left: Date, right: Date): number {
  return formatDateOnly(left).localeCompare(formatDateOnly(right));
}

export function getRentalDays(pickup: Date, returnBoundary: Date): number {
  return dateDifferenceInDays(
    formatDateOnly(pickup),
    formatDateOnly(returnBoundary),
  );
}

export function getOneDayReturnBoundary(pickup: Date): Date {
  return addDays(pickup, 1);
}

export function isDateReserved(
  date: Date,
  unavailableRanges: CalendarDateSpan[],
): boolean {
  return unavailableRanges.some(
    (range) =>
      compareDateOnly(date, range.from) >= 0 &&
      compareDateOnly(date, range.to) <= 0,
  );
}

export function rentalIntervalOverlapsUnavailable(
  pickup: Date,
  returnBoundary: Date,
  unavailableRanges: CalendarDateSpan[],
): boolean {
  const pickupValue = formatDateOnly(pickup);
  const returnValue = formatDateOnly(returnBoundary);

  return unavailableRanges.some((range) => {
    const unavailableStart = formatDateOnly(range.from);
    const unavailableEndExclusive = formatDateOnly(addDays(range.to, 1));

    return pickupValue < unavailableEndExclusive && returnValue > unavailableStart;
  });
}

export function getRentalRangeError(
  pickup: Date,
  returnBoundary: Date,
  unavailableRanges: CalendarDateSpan[],
  maxRentalDays: number,
): string | null {
  const rentalDays = getRentalDays(pickup, returnBoundary);

  if (rentalDays < 1) {
    return "Return must be after pickup.";
  }

  if (rentalDays > maxRentalDays) {
    return `The maximum rental period is ${maxRentalDays} days.`;
  }

  if (
    rentalIntervalOverlapsUnavailable(
      pickup,
      returnBoundary,
      unavailableRanges,
    )
  ) {
    return "Your rental cannot include reserved dates.";
  }

  return null;
}

export function canUseAsPickupDate(
  date: Date,
  earliestPickupDate: Date,
  latestPickupDate: Date,
  unavailableRanges: CalendarDateSpan[],
): boolean {
  return (
    compareDateOnly(date, earliestPickupDate) >= 0 &&
    compareDateOnly(date, latestPickupDate) <= 0 &&
    !isDateReserved(date, unavailableRanges)
  );
}

