import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeInternalRedirectPath } from "@/lib/validations/auth.validation";

type UserRole = "customer" | "admin";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const redirectTo = getSafeInternalRedirectPath(
    requestUrl.searchParams.get("redirectTo"),
  );
  const callbackUrl = new URL("/api/auth/callback", origin);
  const loginErrorUrl = new URL("/login", origin);

  if (redirectTo) {
    callbackUrl.searchParams.set("redirectTo", redirectTo);
    loginErrorUrl.searchParams.set("redirectTo", redirectTo);
  }

  loginErrorUrl.searchParams.set("error", "google-auth-failed");

  try {
    const supabase = await createClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (!claimsError && claimsData?.claims?.sub) {
      const role = claimsData.claims.user_role as UserRole | undefined;

      const destination =
        redirectTo ?? (role === "admin" ? "/admin" : "/profile");

      return NextResponse.redirect(new URL(destination, origin));
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error || !data.url) {
      console.error("Google OAuth initialization error:", error);

      return NextResponse.redirect(loginErrorUrl);
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error("Google OAuth route error:", error);

    return NextResponse.redirect(loginErrorUrl);
  }
}
