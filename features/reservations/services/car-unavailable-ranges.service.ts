import { addDays } from "date-fns";

import { parseDateOnly } from "@/lib/reservations/reservation-date";
import type { CarUnavailableRangesInput } from "@/lib/validations/reservation.validation";

import type { UnavailableDateRange } from "../reservation.types";

export class CarUnavailableRangesRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarUnavailableRangesRequestError";
  }
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
    throw new CarUnavailableRangesRequestError(
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
      throw new CarUnavailableRangesRequestError(
        "The unavailable dates response was invalid.",
      );
    }

    const from = parseDateOnly(value.startDate);
    const endDateExclusive = parseDateOnly(value.endDateExclusive);

    if (!from || !endDateExclusive || endDateExclusive <= from) {
      throw new CarUnavailableRangesRequestError(
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

export async function fetchCarUnavailableRanges(
  input: CarUnavailableRangesInput,
  signal?: AbortSignal,
): Promise<UnavailableDateRange[]> {
  const searchParams = new URLSearchParams({
    from: input.from,
    to: input.to,
  });
  const response = await fetch(
    `/api/cars/${encodeURIComponent(input.carId)}/unavailable-ranges?${searchParams.toString()}`,
    { cache: "no-store", signal },
  );

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new CarUnavailableRangesRequestError(
      `Unable to load unavailable dates. The server returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new CarUnavailableRangesRequestError(
      readErrorMessage(payload) ??
        "Unable to load unavailable dates. Please try again.",
    );
  }

  return parseUnavailableRanges(payload);
}
