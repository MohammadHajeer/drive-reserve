"use client";

import { SyntheticEvent, useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [queryError, setQueryError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const errorParam = params.get("error");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (errorParam) {
      setQueryError(errorParam);
    }
  }, []);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setGeneralError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result?.error?.fieldErrors?.email?.length) {
          setFieldError(result.error.fieldErrors.email[0]);
        } else if (result?.error?.message) {
          setGeneralError(result.error.message);
        } else {
          setGeneralError("Unable to send the password reset link. Please try again.");
        }
        return;
      }

      setSuccessMessage(
        "A password reset link has been sent. Check your inbox."
      );
    } catch (error) {
      setGeneralError("Unable to send the password reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-xl shadow-slate-950/5 sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Password recovery
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Reset your password
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Enter the email address for your account and we&apos;ll send you a recovery link.
          </p>
        </div>

        {queryError === "invalid-or-expired-link" ? (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Your recovery link is invalid or expired. Request a new password reset email.
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {generalError ? (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {generalError}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-3xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="you@example.com"
              required
            />
            {fieldError ? (
              <p className="text-sm text-destructive">{fieldError}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send recovery email"}
          </button>
        </form>
      </div>
    </main>
  );
}
