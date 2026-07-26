import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeInternalRedirectPath } from "@/lib/validations/auth.validation";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const redirectTo = getSafeInternalRedirectPath(
    request.nextUrl.searchParams.get("redirectTo"),
  );

  const successRedirect = redirectTo
    ? new URL(redirectTo, request.nextUrl.origin)
    : new URL("/login", request.nextUrl.origin);

  const errorRedirect = request.nextUrl.clone();
  errorRedirect.pathname = "/login";
  errorRedirect.search = "";
  errorRedirect.searchParams.set("verification", "failed");

  if (!tokenHash || !type) {
    return NextResponse.redirect(errorRedirect);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    console.error("Email confirmation error:", error);

    return NextResponse.redirect(errorRedirect);
  }

  return NextResponse.redirect(successRedirect);
}
