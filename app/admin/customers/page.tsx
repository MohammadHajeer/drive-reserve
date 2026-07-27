import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminCustomersPage } from "@/components/admin/customers/admin-customers-page";
import { CustomersLoadingSkeleton } from "@/components/admin/customers/customers-states";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersLoadingSkeleton />}>
      <AdminCustomersPage />
    </Suspense>
  );
}
