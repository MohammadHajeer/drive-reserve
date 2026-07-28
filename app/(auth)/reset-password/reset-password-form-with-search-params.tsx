"use client";

import { useSearchParams } from "next/navigation";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export function ResetPasswordFormWithSearchParams() {
  const searchParams = useSearchParams();
  const requestedNextUrl = searchParams.get("next");
  const nextUrl =
    requestedNextUrl?.startsWith("/") && !requestedNextUrl.startsWith("//")
      ? requestedNextUrl
      : "/";
  const initialErrorMessage =
    searchParams.get("error") === "invalid-or-expired-link"
      ? "Your reset session is invalid or expired. Request a new password reset link."
      : undefined;

  return (
    <ResetPasswordForm
      nextUrl={nextUrl}
      initialErrorMessage={initialErrorMessage}
    />
  );
}
