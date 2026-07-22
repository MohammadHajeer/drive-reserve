"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.78.5 3.82 1.49l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

export function GoogleAuthButton() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    function handlePageShow() {
      // Reset when returning to this page using the browser back button.
      setIsRedirecting(false);
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  function handleGoogleAuth() {
    if (isRedirecting) return;

    setIsRedirecting(true);
    window.location.assign("/api/auth/google");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={isRedirecting}
      aria-label="Continue with Google"
      className="inline-flex h-auto w-full items-center justify-center gap-3 rounded-3xl border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isRedirecting ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleIcon />
      )}
      {isRedirecting ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}
