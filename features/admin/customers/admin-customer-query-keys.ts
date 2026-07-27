import type { AdminCustomersQuery } from "./admin-customer.types";
export const adminCustomerQueryKeys = {
  all: ["admin", "customers"] as const,
  list: (query: AdminCustomersQuery) => [...adminCustomerQueryKeys.all, "list", query] as const,
  detail: (customerId: string) => [...adminCustomerQueryKeys.all, "detail", customerId] as const,
};
