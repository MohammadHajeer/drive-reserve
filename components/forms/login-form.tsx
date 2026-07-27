"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { loginSchema } from "@/lib/validations/auth.validation";

import { parseAuthResponse } from "./auth-form-utils";
import { FormInputField } from "./form-input-field";

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  initialErrorMessage?: string;
  redirectTo?: string;
};

export function LoginForm({ initialErrorMessage, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (initialErrorMessage) {
      toast.error(initialErrorMessage, { id: "auth-redirect-error" });
    }
  }, [initialErrorMessage]);

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await parseAuthResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error?.message ??
            "Unable to sign in. Please check your credentials and try again.",
        );
        return;
      }

      const destination = redirectTo ?? "/";
      const toastMessage = redirectTo
        ? "Signed in successfully. Redirecting to your reservation..."
        : "Signed in successfully. Redirecting to the homepage...";

      toast.success(toastMessage);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      router.push(destination);
      router.refresh();
    } catch {
      toast.error("Unable to sign in. Please try again.");
    }
  }

  const registerHref = redirectTo
    ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <div className="space-y-6">
      <GoogleAuthButton redirectTo={redirectTo} />

      <div className="flex items-center gap-4" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          or continue with
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="gap-6">
          <FormInputField
            control={form.control}
            name="email"
            label="Institutional email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="name@organization.com"
            required
          />

          <FormInputField
            control={form.control}
            name="password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            passwordToggle
            required
            labelAction={
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Forgot password?
              </Link>
            }
          />
        </FieldGroup>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex h-auto w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting
            ? "Signing in..."
            : "Login to your account"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
