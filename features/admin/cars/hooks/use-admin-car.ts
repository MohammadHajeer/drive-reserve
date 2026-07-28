"use client";

import { useQuery } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import {
  AdminCarRequestError,
  fetchAdminCar,
} from "../services/admin-car.service";

export function useAdminCar(carId?: string | null) {
  return useQuery({
    queryKey: adminCarQueryKeys.detail(carId ?? ""),
    queryFn: ({ signal }) => {
      if (!carId) {
        throw new AdminCarRequestError(
          "A car ID is required.",
          "INVALID_CAR_ID",
          400,
        );
      }

      return fetchAdminCar(carId, signal);
    },
    enabled: Boolean(carId),
  });
}
