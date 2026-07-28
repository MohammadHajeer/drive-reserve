"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminReservationQueryKeys } from "../admin-reservation-query-keys";
import type { AdminReservationsQuery } from "../admin-reservation.types";
import { normalizeAdminReservationsQuery } from "../admin-reservation.types";
import { fetchAdminReservations } from "../services/admin-reservation.service";

export function useAdminReservations(query: AdminReservationsQuery = {}) {
  const normalizedQuery = normalizeAdminReservationsQuery(query);

  return useQuery({
    queryKey: adminReservationQueryKeys.list(normalizedQuery),
    queryFn: ({ signal }) =>
      fetchAdminReservations(normalizedQuery, signal),
    placeholderData: keepPreviousData,
  });
}
