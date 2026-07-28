"use client";

import { useQuery } from "@tanstack/react-query";

import { customerProfileQueryKeys } from "../customer-profile-query-keys";
import { fetchCustomerProfileStats } from "../services/customer-profile.service";

export function useCustomerProfileStats() {
  return useQuery({
    queryKey: customerProfileQueryKeys.stats(),
    queryFn: ({ signal }) => fetchCustomerProfileStats(signal),
  });
}

