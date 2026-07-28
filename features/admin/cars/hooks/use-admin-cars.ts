"use client";

import { useQuery } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { fetchAdminCars } from "../services/admin-car.service";
import type { AdminCarsQuery } from "../admin-car.types";

export function useAdminCars(query: AdminCarsQuery = {}) {
  return useQuery({
    queryKey: adminCarQueryKeys.list(query),
    queryFn: ({ signal }) => fetchAdminCars(query, signal),
  });
}
