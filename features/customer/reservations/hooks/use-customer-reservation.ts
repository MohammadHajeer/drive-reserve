"use client";

import { useQuery } from "@tanstack/react-query";

import { customerReservationQueryKeys } from "../customer-reservations-query-keys";
import { fetchCustomerReservation } from "../services/customer-reservations.service";

export function useCustomerReservation(reservationId: string) {
  return useQuery({
    queryKey: customerReservationQueryKeys.detail(reservationId),
    queryFn: ({ signal }) => fetchCustomerReservation(reservationId, signal),
    enabled: Boolean(reservationId),
  });
}
