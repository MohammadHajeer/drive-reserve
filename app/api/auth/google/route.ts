import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type UserRole = "customer" | "admin";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const supabase = await createClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (!claimsError && claimsData?.claims?.sub) {
      const role = claimsData.claims.user_role as UserRole | undefined;

      const destination = role === "admin" ? "/admin" : "/profile";

      return NextResponse.redirect(new URL(destination, origin));
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error || !data.url) {
      console.error("Google OAuth initialization error:", error);

      return NextResponse.redirect(
        new URL("/login?error=google-auth-failed", origin),
      );
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error("Google OAuth route error:", error);

    return NextResponse.redirect(
      new URL("/login?error=google-auth-failed", origin),
    );
  }
}
