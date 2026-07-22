"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Smartphone, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { registerSchema } from "@/lib/validations/auth.validation";

import { parseAuthResponse } from "./auth-form-utils";
import { FormInputField } from "./form-input-field";

type RegisterFormValues = z.infer<typeof registerSchema>;

const registrationSuccessMessage =
  "Your account was created. Check your email to verify your account.";

export function RegisterForm() {
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
          "Unable to create your account. Please check the form and try again.";

        form.setError("root.serverError", {
          type: "server",
          message: errorMessage,
        });
        toast.error(errorMessage);
        return;
      }

      toast.success(result.message ?? registrationSuccessMessage);
    } catch {
      const errorMessage = "Unable to create your account. Please try again.";

      form.setError("root.serverError", {
        type: "server",
        message: errorMessage,
      });
      toast.error(errorMessage);
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-50 p-4 text-sm text-emerald-700">
        {registrationSuccessMessage}
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Sign in
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
          className="inline-flex h-auto w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>
    </div>
  );
}
