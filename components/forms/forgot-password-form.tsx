"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { forgotPasswordSchema } from "@/lib/validations/auth.validation";

import { parseAuthResponse } from "./auth-form-utils";
import { FormInputField } from "./form-input-field";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordFormProps = {
  initialEmail?: string;
  initialErrorMessage?: string;
};

const privacySafeSuccessMessage =
  "A password reset link has been sent. Check your inbox.";

export function ForgotPasswordForm({
  initialEmail = "",
  initialErrorMessage,
}: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await parseAuthResponse(response);

      if (result.error?.code === "USER_NOT_FOUND") {
        toast.success(privacySafeSuccessMessage);
        return;
      }

      if (!response.ok || !result.success) {
        toast.error(
          result.error?.message ??
            "Unable to send the password reset link. Please try again.",
        );
        return;
      }

      toast.success(result.message ?? privacySafeSuccessMessage);
    } catch {
      toast.error("Unable to send the password reset link. Please try again.");
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
            name="email"
            label="Email address"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </FieldGroup>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex h-auto w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Sending..." : "Send recovery email"}
        </Button>
      </form>
    </>
  );
}
