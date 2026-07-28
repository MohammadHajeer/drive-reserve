import "server-only";

import { getAppRole, type AppRole } from "@/lib/supabase/route-access";
import { createClient } from "@/lib/supabase/server";

export type CustomerAccess =
  | {
      authenticated: true;
      role: "customer";
      userId: string;
      email: string | null;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | {
      authenticated: false;
      role: undefined;
    }
  | {
      authenticated: true;
      role: Exclude<AppRole, "customer"> | undefined;
    };

export async function getCustomerAccess(): Promise<CustomerAccess> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || typeof claims?.sub !== "string") {
    return { authenticated: false, role: undefined };
  }

  const role = getAppRole(claims);

  if (role !== "customer") {
    return { authenticated: true, role };
  }

  return {
    authenticated: true,
    role,
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    supabase,
  };
}
