import type { AdminCarsQuery } from "./admin-car.types";

export const adminCarQueryKeys = {
  all: ["admin", "cars"] as const,

  lists: () => [...adminCarQueryKeys.all, "list"] as const,

  list: (query: AdminCarsQuery = {}) =>
    [...adminCarQueryKeys.lists(), query] as const,

  details: () => [...adminCarQueryKeys.all, "detail"] as const,

  detail: (carId: string) =>
    [...adminCarQueryKeys.details(), carId] as const,
};
