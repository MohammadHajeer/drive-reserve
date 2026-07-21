import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth.validation";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the submitted credentials.",
            fieldErrors: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      if (error.code === "over_request_rate_limit") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Too many login attempts. Please try again shortly.",
            },
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "The email or password is incorrect.",
          },
        },
        { status: 401 },
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SESSION_CREATION_FAILED",
            message: "Unable to create your session.",
          },
        },
        { status: 500 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      // Avoid leaving the user signed in with an incomplete account.
      await supabase.auth.signOut();

      console.error("Login profile error:", profileError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_LOAD_FAILED",
            message: "Unable to load your account profile.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: profile.full_name,
            phone: profile.phone,
            role: profile.role,
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
    console.error("Login route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}