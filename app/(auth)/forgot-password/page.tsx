import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

import { ForgotPasswordFormWithSearchParams } from "./forgot-password-form-with-search-params";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Request a secure password reset link for your DriveReserve account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Password recovery"
        title="Reset your password"
        description="Enter the email address for your account and we'll send you a recovery link."
      />

      <Suspense fallback={<ForgotPasswordForm />}>
        <ForgotPasswordFormWithSearchParams />
      </Suspense>

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
