import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/forms/login-form";

import { LoginContentWithSearchParams } from "./login-content-with-search-params";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to DriveReserve to access vehicle reservations and manage your rentals.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="Secure login"
        title="Sign in to your account"
        description="Enter your institutional credentials to access the DriveReserve reservation platform."
      />

      <Suspense fallback={<LoginContentFallback />}>
        <LoginContentWithSearchParams />
      </Suspense>
    </AuthLayout>
  );
}

function LoginContentFallback() {
  return (
    <>
      <LoginForm />

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        New user?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Create account
        </Link>
      </div>
    </>
  );
}
