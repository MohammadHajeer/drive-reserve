import type { Metadata } from "next";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a secure new password for your DriveReserve account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const requestedNextUrl = firstSearchParam(params.next);
  const nextUrl =
    requestedNextUrl?.startsWith("/") && !requestedNextUrl.startsWith("//")
      ? requestedNextUrl
      : "/";
  const queryError = firstSearchParam(params.error);

  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Reset password"
        title="Choose a new password"
        description="Set a secure new password to continue."
      />

      {queryError === "invalid-or-expired-link" ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Your reset session is invalid or expired. Request a new password reset
          link.
        </div>
      ) : null}

      <ResetPasswordForm nextUrl={nextUrl} />
    </AuthLayout>
  );
}
