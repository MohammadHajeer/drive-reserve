import type { CarUnavailableRangesInput } from "@/lib/validations/reservation.validation";

import type { ReservationPreviewInput } from "./reservation.types";

export const reservationQueryKeys = {
  all: ["reservations"] as const,

  cars: () => [...reservationQueryKeys.all, "car"] as const,

  car: (carId: string) =>
    [...reservationQueryKeys.cars(), carId] as const,

  unavailableRanges: (carId: string) =>
    [...reservationQueryKeys.car(carId), "unavailable-ranges"] as const,

  unavailableRange: (input: CarUnavailableRangesInput) =>
    [
      ...reservationQueryKeys.unavailableRanges(input.carId),
      input.from,
      input.to,
    ] as const,

  unavailableRangeIdle: () =>
    [...reservationQueryKeys.all, "unavailable-ranges", "idle"] as const,

  previews: (carId: string) =>
    [...reservationQueryKeys.car(carId), "preview"] as const,

  preview: (input: ReservationPreviewInput) =>
    [
      ...reservationQueryKeys.previews(input.carId),
      input.pickupDate,
      input.returnDate,
    ] as const,

  previewIdle: () =>
    [...reservationQueryKeys.all, "preview", "idle"] as const,
};
