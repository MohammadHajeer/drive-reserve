import type { ReservationPreviewInput } from "./reservation.types";

export const reservationQueryKeys = {
  all: ["reservations"] as const,

  previews: () => [...reservationQueryKeys.all, "preview"] as const,

  preview: (input: ReservationPreviewInput) =>
    [
      ...reservationQueryKeys.previews(),
      input.carId,
      input.pickupDate,
      input.returnDate,
    ] as const,

  previewIdle: () => [...reservationQueryKeys.previews(), "idle"] as const,
};
