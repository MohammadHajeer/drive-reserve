import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validations/auth.validation";

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
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Enter a valid email address.",
            fieldErrors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
    ).replace(/\/$/, "");

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      {
        redirectTo: `${siteUrl}/api/auth/recovery`,
      },
    );

    if (error) {
      console.error("Forgot-password error:", error);

      if (error.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message:
                "Too many password reset requests. Please try again later.",
            },
          },
          { status: 429 },
        );
      }

      if (error.code === "user_not_found" || error.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "No account exists for this email address.",
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PASSWORD_RESET_EMAIL_FAILED",
            message: "Unable to send the password reset email.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "A password reset link has been sent. Check your inbox.",
    });
  } catch (error) {
    console.error("Forgot-password route error:", error);

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
