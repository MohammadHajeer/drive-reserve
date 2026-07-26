"use client";

import { LoaderCircle, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  compact?: boolean;
};

export function LogoutButton({
  className,
  variant = "outline",
  compact = false,
}: LogoutButtonProps) {
  const { logout, isLoggingOut } = useLogout();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={isLoggingOut}
      onClick={() => void logout()}
    >
      {isLoggingOut ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
        {isLoggingOut ? "Signing out..." : "Sign out"}
      </span>
    </Button>
  );
}

