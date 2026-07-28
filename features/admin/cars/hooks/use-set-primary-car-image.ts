"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { setPrimaryAdminCarImage } from "../services/admin-car.service";

export function useSetPrimaryCarImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPrimaryAdminCarImage,
    onSuccess: (_image, { carId }) =>
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
