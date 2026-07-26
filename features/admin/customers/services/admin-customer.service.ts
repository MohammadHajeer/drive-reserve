import { adminCustomersMock } from "../mock/admin-customers.mock";
import type { AdminCustomer, AdminCustomersQuery, AdminCustomersResponse, CustomerStatus } from "../admin-customer.types";

const customers = structuredClone(adminCustomersMock);
const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const inRange = (date: string, from?: string, to?: string) => (!from || date >= from) && (!to || date <= to);

export async function getAdminCustomers(query: AdminCustomersQuery): Promise<AdminCustomersResponse> {
  await wait();
  const search = query.search?.toLowerCase().trim();
  let filtered = customers.filter((customer) =>
    (!search || [customer.fullName, customer.email, customer.phone].some((value) => value.toLowerCase().includes(search))) &&
    (!query.status || customer.status === query.status) && inRange(customer.createdAt, query.joinedFrom, query.joinedTo)
  );
  filtered = [...filtered].sort((a,b) => {
    if (query.sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (query.sort === "most-reservations") return b.totalReservations-a.totalReservations;
    if (query.sort === "highest-spend") return b.totalSpent-a.totalSpent;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const page = query.page ?? 1; const limit = query.limit ?? 6; const total = filtered.length;
  const now = new Date();
  const newThisMonth = customers.filter((c) => { const d = new Date(c.createdAt); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length;
  return {
    customers: filtered.slice((page-1)*limit,page*limit),
    summary: { total: customers.length, active: customers.filter(c=>c.status==="active").length, suspended: customers.filter(c=>c.status==="suspended").length, newThisMonth },
    pagination: { page, limit, total, totalPages: Math.max(1,Math.ceil(total/limit)) },
  };
}

export async function getAdminCustomer(customerId: string): Promise<AdminCustomer> {
  await wait(); const customer = customers.find((item)=>item.id===customerId); if(!customer) throw new Error("Customer not found."); return customer;
}

export async function updateAdminCustomerStatus(customerId: string, status: CustomerStatus): Promise<AdminCustomer> {
  await wait(350); const index=customers.findIndex((item)=>item.id===customerId); if(index<0) throw new Error("Customer not found.");
  customers[index]={...customers[index],status,updatedAt:new Date().toISOString()}; return customers[index];
}
