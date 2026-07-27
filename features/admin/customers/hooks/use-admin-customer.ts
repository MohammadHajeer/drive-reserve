"use client";

import { useQuery } from "@tanstack/react-query";

import { adminCustomerQueryKeys } from "../admin-customer-query-keys";
import { fetchAdminCustomer } from "../services/admin-customer.service";
import { adminCustomerIdSchema } from "@/lib/validations/admin-customers.validation";

export function useAdminCustomer(customerId: string) {
  const isValidCustomerId =
    adminCustomerIdSchema.safeParse(customerId).success;
  const query = useQuery({
    queryKey: adminCustomerQueryKeys.detail(customerId),
    queryFn: ({ signal }) => fetchAdminCustomer(customerId, signal),
    enabled: isValidCustomerId,
    staleTime: 30_000,
  });

  return { ...query, isValidCustomerId };
}
