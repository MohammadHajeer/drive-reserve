"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { resetPasswordSchema } from "@/lib/validations/auth.validation";

import { parseAuthResponse } from "./auth-form-utils";
import { FormInputField } from "./form-input-field";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordFormProps = {
  nextUrl?: string;
  initialErrorMessage?: string;
};

export function ResetPasswordForm({
  nextUrl = "/",
  initialErrorMessage,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await parseAuthResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error?.message ??
            "Unable to reset your password. Please try again.",
        );
        return;
      }

      toast.success(
        "Your password has been reset successfully. Redirecting...",
      );
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      router.push(nextUrl);
      router.refresh();
    } catch {
      toast.error("Unable to reset your password. Please try again.");
    }
  }

  return (
    <>
      {initialErrorMessage ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {initialErrorMessage}
        </div>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="gap-6">
          <FormInputField
            control={form.control}
            name="password"
            label="New password"
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
          {form.formState.isSubmitting ? "Saving..." : "Reset password"}
        </Button>
      </form>
    </>
  );
}
