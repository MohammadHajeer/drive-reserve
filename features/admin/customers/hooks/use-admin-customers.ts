import { useQuery } from "@tanstack/react-query";
import { adminCustomerQueryKeys } from "../admin-customer-query-keys";
import type { AdminCustomersQuery } from "../admin-customer.types";
import { getAdminCustomers } from "../services/admin-customer.service";
export function useAdminCustomers(query: AdminCustomersQuery){return useQuery({queryKey:adminCustomerQueryKeys.list(query),queryFn:()=>getAdminCustomers(query)});}
