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

const Toaster = ({
  toastOptions,
  ...props
}: ToasterProps) => {
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
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CircleCheckIcon className="size-4" />
          </span>
        ),
        info: (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <InfoIcon className="size-4" />
          </span>
        ),
        warning: (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TriangleAlertIcon className="size-4" />
          </span>
        ),
        error: (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <OctagonXIcon className="size-4" />
          </span>
        ),
        loading: (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2Icon className="size-4 animate-spin" />
          </span>
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as CSSProperties
      }
      toastOptions={{
        duration: 4000,
        ...toastOptions,
        classNames: {
          toast:
            "group/toast !w-[calc(100vw-2rem)] !max-w-sm !rounded-2xl !border !border-border/70 !bg-card !p-4 !text-card-foreground !shadow-xl !shadow-slate-950/10 backdrop-blur-sm sm:!w-full",

          content: "!gap-1",

          title:
            "!text-sm !font-semibold !tracking-tight !text-foreground",

          description:
            "!text-sm !leading-5 !text-muted-foreground",

          icon:
            "!mr-1 !size-8 !self-start",

          closeButton:
            "!right-2 !top-2 !size-7 !rounded-full !border-border/70 !bg-background !text-muted-foreground !shadow-sm transition-colors hover:!bg-muted hover:!text-foreground",

          actionButton:
            "!h-8 !rounded-xl !bg-primary !px-3 !text-xs !font-semibold !text-primary-foreground hover:!bg-primary/90",

          cancelButton:
            "!h-8 !rounded-xl !bg-secondary !px-3 !text-xs !font-semibold !text-secondary-foreground hover:!bg-secondary/80",

          success:
            "!border-emerald-500/20 dark:!border-emerald-400/20",

          info:
            "!border-primary/20",

          warning:
            "!border-amber-500/20 dark:!border-amber-400/20",

          error:
            "!border-destructive/20",

          loading:
            "!border-primary/20",

          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };