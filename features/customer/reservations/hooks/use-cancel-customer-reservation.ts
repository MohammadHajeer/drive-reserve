"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerReservationQueryKeys } from "../customer-reservations-query-keys";
import { cancelCustomerReservation } from "../services/customer-reservations.service";

export function useCancelCustomerReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelCustomerReservation,
    onSuccess: (reservation) => {
      queryClient.setQueryData(
        customerReservationQueryKeys.detail(reservation.id),
        reservation,
      );

      return queryClient.invalidateQueries({
        queryKey: customerReservationQueryKeys.lists(),
      });
    },
  });
}
