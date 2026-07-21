import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth.validation";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "The request body must contain valid JSON.",
          },
        },
        { status: 400 },
      );
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the submitted information.",
            fieldErrors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { fullName, email, phone, password } = parsed.data;

    const supabase = await createClient();

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
    ).replace(/\/$/, "");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/confirm`,
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    });

    if (error) {
      console.error("Registration error:", error);

      if (error.code === "over_request_rate_limit" || error.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message:
                "Too many registration attempts. Please try again later.",
            },
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REGISTRATION_FAILED",
            message: "Unable to create your account.",
          },
        },
        { status: 400 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REGISTRATION_FAILED",
            message: "Unable to create your account.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          email,
          requiresEmailVerification: data.session === null,
        },
        message:
          "Your account was created. Check your email to verify your account.",
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Registration route error:", error);

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
