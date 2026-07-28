"use client";

import { useQuery } from "@tanstack/react-query";

import {
  carUnavailableRangesSchema,
  type CarUnavailableRangesInput,
} from "@/lib/validations/reservation.validation";

import { reservationQueryKeys } from "../reservation-query-keys";
import {
  CarUnavailableRangesRequestError,
  fetchCarUnavailableRanges,
} from "../services/car-unavailable-ranges.service";
import type { UnavailableDateRange } from "../reservation.types";

export function useCarUnavailableRanges(input: CarUnavailableRangesInput) {
  const enabled = carUnavailableRangesSchema.safeParse(input).success;

  return useQuery<UnavailableDateRange[], CarUnavailableRangesRequestError>({
    queryKey: enabled
      ? reservationQueryKeys.unavailableRange(input)
      : reservationQueryKeys.unavailableRangeIdle(),
    queryFn: ({ signal }) => fetchCarUnavailableRanges(input, signal),
    enabled,
  });
}
