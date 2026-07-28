"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminCarQueryKeys } from "../admin-car-query-keys";
import { uploadAdminCarImages } from "../services/admin-car.service";

export function useUploadCarImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAdminCarImages,
    onSuccess: (_images, { carId }) =>
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
