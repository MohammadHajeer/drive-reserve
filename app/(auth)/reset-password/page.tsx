import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

import { ResetPasswordFormWithSearchParams } from "./reset-password-form-with-search-params";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a secure new password for your DriveReserve account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Reset password"
        title="Choose a new password"
        description="Set a secure new password to continue."
      />

      <Suspense fallback={<ResetPasswordForm />}>
        <ResetPasswordFormWithSearchParams />
      </Suspense>
    </AuthLayout>
  );
}
