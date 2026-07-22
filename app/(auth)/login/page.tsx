import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to DriveReserve to access vehicle reservations and manage your rentals.",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    verification?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = firstSearchParam(params.error);
  const verification = firstSearchParam(params.verification);
  const initialErrorMessage =
    error === "profile-load-failed"
      ? "Unable to load your account profile. Please try again."
      : error === "google-auth-failed"
        ? "Unable to continue with Google. Please try again."
        : verification === "failed"
          ? "Unable to verify your email. The verification link may be invalid or expired."
          : undefined;

  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Secure login"
        title="Sign in to your account"
        description="Enter your institutional credentials to access the DriveReserve reservation platform."
      />

      <LoginForm initialErrorMessage={initialErrorMessage} />

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        New user?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}
