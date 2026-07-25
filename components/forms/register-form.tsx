"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Smartphone, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { registerSchema } from "@/lib/validations/auth.validation";

import { parseAuthResponse } from "./auth-form-utils";
import { FormInputField } from "./form-input-field";

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  redirectTo?: string;
};

const registrationSubmittedMessage =
  "Check your email for a verification link. If you already have an account, sign in or reset your password.";

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    form.clearErrors("root.serverError");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          phone: values.phone?.trim() || null,
        }),
      });

      const result = await parseAuthResponse(response);

      if (!response.ok || !result.success) {
        const errorMessage =
          result.error?.message ??
          "Unable to submit your registration. Please try again.";

        form.setError("root.serverError", {
          type: "server",
          message: errorMessage,
        });

        toast.error(errorMessage);
        return;
      }

      setSubmittedEmail(values.email);
      form.reset();

      toast.success(
        result.message ?? "Registration request submitted successfully.",
      );
    } catch {
      const errorMessage =
        "Unable to submit your registration. Please try again.";

      form.setError("root.serverError", {
        type: "server",
        message: errorMessage,
      });

      toast.error(errorMessage);
    }
  }

  const loginHref = redirectTo
    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/login";

  if (submittedEmail) {
    return (
      <div className="rounded-2xl border border-emerald-300/30 bg-emerald-50 p-5 text-sm text-emerald-800">
        <p className="font-semibold">Check your email</p>

        <p className="mt-2 leading-6">{registrationSubmittedMessage}</p>

        <p className="mt-2 font-medium">{submittedEmail}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={loginHref}>
            <Button className="rounded-3xl">Sign in</Button>
          </Link>

          <Link href="/forgot-password">
            <Button variant="outline" className="rounded-3xl">
              Reset password
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GoogleAuthButton />

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
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInputField
              control={form.control}
              name="fullName"
              label="Full name"
              icon={User}
              type="text"
              autoComplete="name"
              placeholder="E.g. Alexander Hamilton"
              required
            />

            <FormInputField
              control={form.control}
              name="phone"
              label="Phone number"
              icon={Smartphone}
              type="tel"
              autoComplete="tel"
              placeholder="E.g. (555) 123-4567"
            />
          </div>

          <FormInputField
            control={form.control}
            name="email"
            label="Email address"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
          />

          <FormInputField
            control={form.control}
            name="password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            passwordToggle
            required
          />

          <FormInputField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            passwordToggle
            required
          />
        </FieldGroup>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-auto w-full rounded-3xl px-5 py-3 text-sm font-semibold"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}