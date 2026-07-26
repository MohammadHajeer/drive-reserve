import type { AdminReservationsQuery } from "./admin-reservation.types";

export const adminReservationQueryKeys = {
  all: ["admin", "reservations"] as const,
  lists: () => [...adminReservationQueryKeys.all, "list"] as const,
  list: (query: AdminReservationsQuery = {}) => [...adminReservationQueryKeys.lists(), query] as const,
  details: () => [...adminReservationQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...adminReservationQueryKeys.details(), id] as const,
};
