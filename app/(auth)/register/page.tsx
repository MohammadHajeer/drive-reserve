import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a DriveReserve account to reserve vehicles, manage rentals, and access your dashboard.",
};

export default function RegisterPage() {
  return (
    <AuthLayout wide>
      <AuthHeader
        eyebrow="Create your account"
        title="Join the future of automotive mobility"
        description="Register with DriveReserve to reserve vehicles, manage rentals, and access your fleet dashboard."
      />

      <RegisterForm />

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  );
}
