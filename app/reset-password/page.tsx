"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [nextUrl, setNextUrl] = useState("/");
  const [queryError, setQueryError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    const errorParam = params.get("error");

    if (nextParam) {
      setNextUrl(nextParam);
    }

    if (errorParam) {
      setQueryError(errorParam);
      if (errorParam === "invalid-or-expired-link") {
        setGeneralError("Your reset session is invalid or expired. Request a new password reset link.");
      }
    }
  }, []);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    setSuccessMessage("");

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      setFieldErrors({ password: "Password is required." });
      return;
    }

    if (trimmedPassword.length < 8) {
      setFieldErrors({ password: "Password must have at least 8 characters." });
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: trimmedPassword, confirmPassword: trimmedConfirm }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result?.error?.fieldErrors?.password?.length) {
          setFieldErrors((prev) => ({ ...prev, password: result.error.fieldErrors.password[0] }));
        } else if (result?.error?.fieldErrors?.confirmPassword?.length) {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: result.error.fieldErrors.confirmPassword[0] }));
        } else if (result?.error?.message) {
          setGeneralError(result.error.message);
        } else {
          setGeneralError("Unable to reset your password. Please try again.");
        }
        return;
      }

      setSuccessMessage("Your password has been reset successfully. Redirecting...");
      window.setTimeout(() => {
        router.push(nextUrl);
      }, 700);
    } catch (error) {
      setGeneralError("Unable to reset your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-xl shadow-slate-950/5 sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Reset password
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose a new password
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Set a secure new password to continue.
          </p>
        </div>

        {generalError ? (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {generalError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-3xl border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Reset password"}
          </button>
        </form>
      </div>
    </main>
  );
}
