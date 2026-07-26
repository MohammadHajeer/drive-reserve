"use client";

import { useQuery } from "@tanstack/react-query";

import { customerProfileQueryKeys } from "../customer-profile-query-keys";
import { fetchCustomerProfile } from "../services/customer-profile.service";

export function useCustomerProfile() {
  return useQuery({
    queryKey: customerProfileQueryKeys.detail(),
    queryFn: ({ signal }) => fetchCustomerProfile(signal),
  });
}

