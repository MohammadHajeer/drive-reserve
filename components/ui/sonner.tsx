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

const Toaster = (props: ToasterProps) => {
  const { resolvedTheme = "system" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="top-right"
      closeButton
      richColors={false}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast border-border bg-popover text-popover-foreground shadow-xl shadow-slate-950/10",
          title: "font-semibold tracking-tight text-foreground",
          description: "text-sm leading-5 text-muted-foreground",
          icon: "text-primary",
          closeButton:
            "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",

          success:
            "[&_[data-icon]]:text-emerald-600 dark:[&_[data-icon]]:text-emerald-400",
          info: "[&_[data-icon]]:text-primary",
          warning:
            "[&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400",
          error:
            "[&_[data-icon]]:text-destructive dark:[&_[data-icon]]:text-red-400",
          loading: "[&_[data-icon]]:text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
