"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { createAdminCar } from "../services/admin-car.service";

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCar,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminCarQueryKeys.lists(),
      }),
  });
}
