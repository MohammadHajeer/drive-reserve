"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { deleteAdminCarImage } from "../services/admin-car.service";

export function useDeleteCarImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCarImage,
    onSuccess: (_deletedImage, { carId }) =>
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
