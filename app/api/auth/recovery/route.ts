import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const errorUrl = new URL("/forgot-password", request.url);
  errorUrl.searchParams.set("error", "invalid-or-expired-link");

  if (!tokenHash || type !== "recovery") {
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error) {
    console.error("Password recovery verification error:", error);
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL("/reset-password", request.url));
}
