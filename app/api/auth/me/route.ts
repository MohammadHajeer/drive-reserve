import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type UserRole = "customer" | "admin";

type DriveReserveClaims = {
  sub?: string;
  user_role?: UserRole;
};

export async function GET() {
  try {
    const supabase = await createClient();

    /*
     * First verify the JWT.
     * Do not use getSession() as the authorization check.
     */
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    const claims = claimsData?.claims as DriveReserveClaims | undefined;
    const authenticatedUserId = claims?.sub;

    if (claimsError || !authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication is required.",
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    /*
     * getUser() gives us the latest Auth user record.
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.id !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Your session is invalid or expired.",
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, created_at")
      .eq("id", authenticatedUserId)
      .single();

    if (profileError || !profile) {
      console.error("Current-user profile error:", profileError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_LOAD_FAILED",
            message: "Unable to load your account profile.",
          },
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    const role = claims.user_role ?? profile.role;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: profile.full_name,
            phone: profile.phone,
            role,
            createdAt: user.created_at,
            lastSignInAt: user.last_sign_in_at,
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Current-user route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }
}
