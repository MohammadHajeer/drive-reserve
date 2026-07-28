"use client";

import type { CSSProperties } from "react";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { resolvedTheme = "system" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="bottom-right"
      closeButton
      expand
      gap={12}
      offset={20}
      visibleToasts={4}
      richColors={false}
      className="toaster group"
      icons={{
        success: (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-400/15">
            <CircleCheckIcon className="size-4" />
          </span>
        ),
        info: (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
            <InfoIcon className="size-4" />
          </span>
        ),
        warning: (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15 dark:text-amber-400 dark:ring-amber-400/15">
            <TriangleAlertIcon className="size-4" />
          </span>
        ),
        error: (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/15">
            <OctagonXIcon className="size-4" />
          </span>
        ),
        loading: (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
            <Loader2Icon className="size-4 animate-spin" />
          </span>
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1.25rem",
        } as CSSProperties
      }
      toastOptions={{
        duration: 4000,
        ...toastOptions,
        classNames: {
          toast:
            "group/toast !w-[calc(100vw-2rem)] !max-w-sm !rounded-2xl !border !border-border/70 !bg-card !p-4 !text-card-foreground !shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16)] dark:!shadow-[0_12px_32px_-10px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:!w-full",

          content: "!gap-1",

          title: "!text-sm !font-semibold !tracking-tight !text-foreground",

          description: "!text-sm !leading-5 !text-muted-foreground",

          icon: "!mr-1 !size-9 !self-start",

          closeButton:
            "!right-2 !top-2 !size-7 !rounded-lg !border !border-border/70 !bg-background !text-muted-foreground !shadow-sm transition-colors hover:!bg-muted hover:!text-foreground",

          actionButton:
            "!h-8 !rounded-lg !bg-primary !px-3 !text-xs !font-semibold !text-primary-foreground !shadow-sm !shadow-primary/20 hover:!bg-primary/90",

          cancelButton:
            "!h-8 !rounded-lg !border !border-border !bg-background !px-3 !text-xs !font-semibold !text-foreground hover:!bg-muted",

          success:
            "!border-emerald-500/25 !bg-emerald-500/[0.04] dark:!border-emerald-400/20 dark:!bg-emerald-400/[0.06]",

          info: "!border-primary/25 !bg-primary/[0.04] dark:!bg-primary/[0.06]",

          warning:
            "!border-amber-500/25 !bg-amber-500/[0.04] dark:!border-amber-400/20 dark:!bg-amber-400/[0.06]",

          error:
            "!border-destructive/25 !bg-destructive/[0.04] dark:!bg-destructive/[0.06]",

          loading:
            "!border-primary/25 !bg-primary/[0.04] dark:!bg-primary/[0.06]",

          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
