"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminReservationQueryKeys } from "../admin-reservation-query-keys";
import { updateAdminReservationStatus } from "../services/admin-reservation.service";

export function useUpdateAdminReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminReservationStatus,
    onSuccess: (reservation) => {
      queryClient.setQueryData(
        adminReservationQueryKeys.detail(reservation.id),
        reservation,
      );
      return queryClient.invalidateQueries({
        queryKey: adminReservationQueryKeys.lists(),
      });
    },
  });
}
