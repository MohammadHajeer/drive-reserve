import {
  normalizeAdminCustomersQuery,
  type AdminCustomersQuery,
} from "./admin-customer.types";

export const adminCustomerQueryKeys = {
  all: ["admin", "customers"] as const,
  lists: () => [...adminCustomerQueryKeys.all, "list"] as const,
  list: (query: AdminCustomersQuery = {}) =>
    [
      ...adminCustomerQueryKeys.lists(),
      normalizeAdminCustomersQuery(query),
    ] as const,
  details: () => [...adminCustomerQueryKeys.all, "detail"] as const,
  detail: (customerId: string) =>
    [...adminCustomerQueryKeys.details(), customerId] as const,
};
