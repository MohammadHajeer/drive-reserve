"use client";

import { useSearchParams } from "next/navigation";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export function ForgotPasswordFormWithSearchParams() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const initialErrorMessage =
    searchParams.get("error") === "invalid-or-expired-link"
      ? "Your recovery link is invalid or expired. Request a new password reset email."
      : undefined;

  return (
    <ForgotPasswordForm
      initialEmail={initialEmail}
      initialErrorMessage={initialErrorMessage}
    />
  );
}
