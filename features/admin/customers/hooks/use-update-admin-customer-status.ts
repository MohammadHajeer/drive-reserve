import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCustomerQueryKeys } from "../admin-customer-query-keys";
import type { CustomerStatus } from "../admin-customer.types";
import { updateAdminCustomerStatus } from "../services/admin-customer.service";
export function useUpdateAdminCustomerStatus(){const client=useQueryClient();return useMutation({mutationFn:({customerId,status}:{customerId:string;status:CustomerStatus})=>updateAdminCustomerStatus(customerId,status),onSuccess:(customer)=>{client.invalidateQueries({queryKey:adminCustomerQueryKeys.all});client.setQueryData(adminCustomerQueryKeys.detail(customer.id),customer);}})}
