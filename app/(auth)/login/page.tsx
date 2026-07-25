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
    redirectTo?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, error } = await searchParams;

  const initialErrorMessage =
    error === "login-failed"
      ? "Unable to sign in. Please check your credentials."
      : undefined;

  const registerHref = redirectTo
    ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Secure login"
        title="Sign in to your account"
        description="Enter your institutional credentials to access the DriveReserve reservation platform."
      />

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
    </AuthLayout>
  );
}