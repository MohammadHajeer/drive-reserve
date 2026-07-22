"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setFieldErrors({ email: "Email is required." });
      return;
    }

    if (!password.trim()) {
      setFieldErrors({ password: "Password is required." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result?.error?.fieldErrors?.email?.length) {
          setFieldErrors((current) => ({ ...current, email: result.error.fieldErrors.email[0] }));
        }

        if (result?.error?.fieldErrors?.password?.length) {
          setFieldErrors((current) => ({ ...current, password: result.error.fieldErrors.password[0] }));
        }

        if (result?.error?.message) {
          setGeneralError(result.error.message);
        } else {
          setGeneralError("Unable to sign in. Please check your credentials and try again.");
        }

        return;
      }

      setSuccessMessage("Signed in successfully. Redirecting to the homepage...");
      window.setTimeout(() => {
        router.push("/");
      }, 700);
    } catch {
      setGeneralError("Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl shadow-slate-950/5 sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Secure login
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Enter your institutional credentials to access the DriveReserve reservation platform.
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
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Institutional email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-input bg-background px-11 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="name@organization.com"
                required
              />
            </div>
            {fieldErrors.email ? (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm font-semibold text-primary transition-colors hover:text-primary/80">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-input bg-background px-11 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          <button
            type="submit"
            disabled={submitting || !!successMessage}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login to your account"}
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          New user?{' '}
          <Link href="/register" className="font-semibold text-primary transition-colors hover:text-primary/80">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
