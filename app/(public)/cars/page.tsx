"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CarsPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSignOut() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push("/");
        return;
      }
    } catch {
      // ignore error and keep the page unchanged
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center rounded-3xl border border-border bg-card p-8 shadow-xl shadow-slate-950/5 sm:p-10">
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-3xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted sm:w-auto"
          >
            Back to homepage
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </main>
  );
}
