"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminCustomerQueryKeys } from "../admin-customer-query-keys";
import type { AdminCustomersQuery } from "../admin-customer.types";
import { normalizeAdminCustomersQuery } from "../admin-customer.types";
import { fetchAdminCustomers } from "../services/admin-customer.service";

export function useAdminCustomers(query: AdminCustomersQuery = {}) {
  const normalizedQuery = normalizeAdminCustomersQuery(query);

  return useQuery({
    queryKey: adminCustomerQueryKeys.list(normalizedQuery),
    queryFn: ({ signal }) => fetchAdminCustomers(normalizedQuery, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
