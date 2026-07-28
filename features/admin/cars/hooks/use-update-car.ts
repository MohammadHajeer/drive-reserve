"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { updateAdminCar } from "../services/admin-car.service";
import type { UpdateAdminCarVariables } from "../admin-car.types";

export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ carId, input }: UpdateAdminCarVariables) =>
      updateAdminCar(carId, input),
    onSuccess: (_car, { carId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminCarQueryKeys.detail(carId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCarQueryKeys.lists(),
        }),
      ]),
  });
}
