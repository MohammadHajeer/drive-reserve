import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  const successRedirect = request.nextUrl.clone();
  successRedirect.pathname = "/login";
  successRedirect.search = "";

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
