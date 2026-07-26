"use client";
import { useQuery } from "@tanstack/react-query";
import { adminReservationQueryKeys } from "../admin-reservation-query-keys";
import { fetchAdminReservation } from "../services/admin-reservation.service";
export function useAdminReservation(id: string) { return useQuery({ queryKey: adminReservationQueryKeys.detail(id), queryFn: ({ signal }) => fetchAdminReservation(id, signal), enabled: Boolean(id) }); }
