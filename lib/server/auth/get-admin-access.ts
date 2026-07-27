import "server-only";

import { getAppRole, type AppRole } from "@/lib/supabase/route-access";
import { createClient } from "@/lib/supabase/server";

export type AdminAccess =
  | {
      authenticated: true;
      role: "admin";
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | { authenticated: false; role: undefined }
  | {
      authenticated: true;
      role: Exclude<AppRole, "admin"> | undefined;
    };

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || typeof claims?.sub !== "string") {
    return { authenticated: false, role: undefined };
  }

  const role = getAppRole(claims);

  if (role !== "admin") {
    return { authenticated: true, role };
  }

  return {
    authenticated: true,
    role,
    userId: claims.sub,
    supabase,
  };
}
