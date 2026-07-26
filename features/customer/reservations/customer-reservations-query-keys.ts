export const customerReservationsQueryKeys = {
  all: ["customer", "reservations"] as const,
  list: () => [...customerReservationsQueryKeys.all, "list"] as const,
};

