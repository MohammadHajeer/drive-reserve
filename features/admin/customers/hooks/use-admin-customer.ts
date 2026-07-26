import { useQuery } from "@tanstack/react-query";
import { adminCustomerQueryKeys } from "../admin-customer-query-keys";
import { getAdminCustomer } from "../services/admin-customer.service";
export function useAdminCustomer(customerId:string){return useQuery({queryKey:adminCustomerQueryKeys.detail(customerId),queryFn:()=>getAdminCustomer(customerId),enabled:Boolean(customerId)});}
