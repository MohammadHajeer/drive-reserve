"use client";
import { useQuery } from "@tanstack/react-query";
import { adminReservationQueryKeys } from "../admin-reservation-query-keys";
import { fetchAdminReservations } from "../services/admin-reservation.service";
import type { AdminReservationsQuery } from "../admin-reservation.types";
export function useAdminReservations(query: AdminReservationsQuery = {}) { return useQuery({ queryKey: adminReservationQueryKeys.list(query), queryFn: ({ signal }) => fetchAdminReservations(query, signal) }); }
