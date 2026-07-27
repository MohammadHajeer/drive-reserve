import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeInternalRedirectPath } from "@/lib/validations/auth.validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = getSafeInternalRedirectPath(
    url.searchParams.get("redirectTo"),
  );

  const loginErrorUrl = new URL("/login", url.origin);
  loginErrorUrl.searchParams.set("error", "google-auth-failed");

  if (redirectTo) {
    loginErrorUrl.searchParams.set("redirectTo", redirectTo);
  }

  if (!code) {
    return NextResponse.redirect(loginErrorUrl);
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("Google OAuth callback error:", error);

      return NextResponse.redirect(loginErrorUrl);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Google OAuth profile error:", profileError);

      await supabase.auth.signOut({ scope: "local" });

      loginErrorUrl.searchParams.set("error", "profile-load-failed");

      return NextResponse.redirect(loginErrorUrl);
    }

    const destination =
      redirectTo ?? (profile.role === "admin" ? "/admin" : "/profile");

    return NextResponse.redirect(new URL(destination, url.origin));
  } catch (error) {
    console.error("Google OAuth callback route error:", error);

    return NextResponse.redirect(loginErrorUrl);
  }
}
