"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress dev-only hydration noise from browser extensions (fdprocessedid, Grammarly) and next-themes script tag
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("Encountered a script tag") ||
      msg.includes("fdprocessedid") ||
      msg.includes("data-new-gr-c-s-check-loaded") ||
      msg.includes("data-gr-ext-installed") ||
      (msg.includes("hydrated but some attributes") && msg.includes("fdprocessedid"))
    ) {
      return;
    }
    // Also suppress the detailed hydration diff that contains fdprocessedid
    const full = args.join(" ");
    if (full.includes("fdprocessedid") || full.includes("data-new-gr-c-s-check-loaded")) {
      return;
    }
    origError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}