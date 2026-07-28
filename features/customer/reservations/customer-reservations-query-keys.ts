export const customerReservationQueryKeys = {
  all: ["customer", "reservations"] as const,
  lists: () => [...customerReservationQueryKeys.all, "list"] as const,
  list: () => [...customerReservationQueryKeys.lists()] as const,
  details: () => [...customerReservationQueryKeys.all, "detail"] as const,
  detail: (reservationId: string) =>
    [...customerReservationQueryKeys.details(), reservationId] as const,
};

export const customerReservationsQueryKeys = customerReservationQueryKeys;
