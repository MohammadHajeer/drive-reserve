import { createClient } from "@/lib/supabase/server";
import { NavbarClient, type NavbarUser } from "./navbar-client";

export async function Navbar() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const user: NavbarUser | null =
    typeof claims?.sub === "string"
      ? {
          id: claims.sub,
          email: typeof claims.email === "string" ? claims.email : null,
          role: claims.user_role === "admin" ? "admin" : "customer",
        }
      : null;

  return <NavbarClient user={user} />;
}
