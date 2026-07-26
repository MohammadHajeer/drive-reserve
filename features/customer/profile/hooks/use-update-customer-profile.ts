"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerProfileQueryKeys } from "../customer-profile-query-keys";
import { updateCustomerProfile } from "../services/customer-profile.service";

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(customerProfileQueryKeys.detail(), profile);
      return queryClient.invalidateQueries({
        queryKey: customerProfileQueryKeys.detail(),
      });
    },
  });
}

