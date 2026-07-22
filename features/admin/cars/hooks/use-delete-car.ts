"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { deleteAdminCar } from "../services/admin-car.service";

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCar,
    onSuccess: (_car, carId) => {
      queryClient.removeQueries({
        queryKey: adminCarQueryKeys.detail(carId),
        exact: true,
      });

      return queryClient.invalidateQueries({
        queryKey: adminCarQueryKeys.lists(),
      });
    },
  });
}
