"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReservationQueryKeys } from "../admin-reservation-query-keys";
import { updateAdminReservationStatus } from "../services/admin-reservation.service";
export function useUpdateAdminReservationStatus() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updateAdminReservationStatus, onSuccess: (reservation) => { client.setQueryData(adminReservationQueryKeys.detail(reservation.id), reservation); client.invalidateQueries({ queryKey: adminReservationQueryKeys.lists() }); } });
}
