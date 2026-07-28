import { format } from "date-fns";

import {
  formatDateOnly,
  parseDateOnly,
} from "@/lib/reservations/reservation-date";
import type { ReservationUnavailableReason } from "@/lib/server/reservations/preview-reservation";

export { formatDateOnly, parseDateOnly };

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
