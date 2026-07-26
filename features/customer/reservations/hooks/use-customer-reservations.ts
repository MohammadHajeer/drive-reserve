"use client";

import { useQuery } from "@tanstack/react-query";

import { customerReservationsQueryKeys } from "../customer-reservations-query-keys";
import { fetchCustomerReservations } from "../services/customer-reservations.service";

export function useCustomerReservations() {
  return useQuery({
    queryKey: customerReservationsQueryKeys.list(),
    queryFn: ({ signal }) => fetchCustomerReservations(signal),
  });
}

