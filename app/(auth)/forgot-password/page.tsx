import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Request a secure password reset link for your DriveReserve account.",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    error?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const initialEmail = firstSearchParam(params.email) ?? "";
  const queryError = firstSearchParam(params.error);

  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Password recovery"
        title="Reset your password"
        description="Enter the email address for your account and we'll send you a recovery link."
      />

      {queryError === "invalid-or-expired-link" ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Your recovery link is invalid or expired. Request a new password reset
          email.
        </div>
      ) : null}

      <ForgotPasswordForm initialEmail={initialEmail} />

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
