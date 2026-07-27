import type { Metadata } from "next";

import { AdminCustomerDetailsPage } from "@/components/admin/customers/admin-customer-details-page";

export const metadata: Metadata = { title: "Customer details" };

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return <AdminCustomerDetailsPage customerId={customerId} />;
}
