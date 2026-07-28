"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { getSafeInternalRedirectPath } from "@/lib/validations/auth.validation";

const loginErrorMessages: Record<string, string> = {
  "google-auth-failed": "Unable to sign in with Google. Please try again.",
  "login-failed": "Unable to sign in. Please check your credentials.",
  "profile-load-failed":
    "Your sign-in succeeded, but we could not load your account profile.",
};

export function LoginContentWithSearchParams() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeInternalRedirectPath(
    searchParams.get("redirectTo"),
  );
  const error = searchParams.get("error");
  const verification = searchParams.get("verification");
  const initialErrorMessage =
    (error ? loginErrorMessages[error] : undefined) ??
    (verification === "failed"
      ? "Your email verification link is invalid or expired."
      : undefined);
  const registerHref = redirectTo
    ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <>
      <LoginForm
        initialErrorMessage={initialErrorMessage}
        redirectTo={redirectTo}
      />

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        New user?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Create account
        </Link>
      </div>
    </>
  );
}
