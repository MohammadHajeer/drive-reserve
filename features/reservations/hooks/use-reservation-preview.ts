"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { reservationQueryKeys } from "../reservation-query-keys";
import {
  fetchReservationPreview,
  ReservationPreviewRequestError,
} from "../services/reservation-preview.service";
import type {
  ReservationPreview,
  ReservationPreviewInput,
} from "../reservation.types";

function canPreviewReservation(
  input: ReservationPreviewInput | null,
): input is ReservationPreviewInput {
  return Boolean(
    input?.carId &&
    input.pickupDate &&
    input.returnDate &&
    input.returnDate > input.pickupDate,
  );
}

export function useReservationPreview(input: ReservationPreviewInput | null) {
  const enabled = canPreviewReservation(input);

  return useQuery<ReservationPreview, ReservationPreviewRequestError>({
    queryKey: enabled
      ? reservationQueryKeys.preview(input)
      : reservationQueryKeys.previewIdle(),

    queryFn: ({ signal }) => {
      if (!enabled) {
        throw new ReservationPreviewRequestError(
          "Valid reservation dates are required.",
          "INVALID_PREVIEW_INPUT",
        );
      }

      return fetchReservationPreview(input, signal);
    },

    enabled,
    staleTime: 0,
    retry: false,
    placeholderData: keepPreviousData,
  });
}
