import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { CustomerNavigation } from "@/components/customer/customer-navigation";
import { APP_ROUTES } from "@/lib/routes";
import { getCustomerAccess } from "@/lib/server/auth/get-customer-access";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getCustomerAccess();

  if (!access.authenticated) {
    redirect(APP_ROUTES.login);
  }

  if (access.role === "admin") {
    redirect(APP_ROUTES.admin);
  }

  if (access.role !== "customer") {
    redirect(APP_ROUTES.unauthorized);
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <CustomerNavigation email={access.email} />
      <main>{children}</main>
    </div>
  );
}
