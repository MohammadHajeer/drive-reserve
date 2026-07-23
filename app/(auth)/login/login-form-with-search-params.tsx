"use client";

import { useSearchParams } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";

export function LoginFormWithSearchParams() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const verification = searchParams.get("verification");
  const initialErrorMessage =
    error === "profile-load-failed"
      ? "Unable to load your account profile. Please try again."
      : error === "google-auth-failed"
        ? "Unable to continue with Google. Please try again."
        : verification === "failed"
          ? "Unable to verify your email. The verification link may be invalid or expired."
          : undefined;

  return <LoginForm initialErrorMessage={initialErrorMessage} />;
}
