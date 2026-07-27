"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { getSafeInternalRedirectPath } from "@/lib/validations/auth.validation";

export function RegisterContentWithSearchParams() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeInternalRedirectPath(
    searchParams.get("redirectTo"),
  );
  const loginHref = redirectTo
    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/login";

  return (
    <>
      <RegisterForm redirectTo={redirectTo} />

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Sign in here
        </Link>
      </div>
    </>
  );
}
