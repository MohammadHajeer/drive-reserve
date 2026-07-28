"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

const ADMIN_NAME = "Administrator";
const ADMIN_EMAIL = "admin@drivereserve.com";

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const initials = ADMIN_NAME.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6 lg:h-18 lg:px-8">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="mr-3 rounded-xl lg:hidden"
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden lg:block">
        <p className="text-xl font-semibold text-foreground">
          DriveReserve Admin
        </p>
        <p className="text-xs text-muted-foreground">
          Fleet and reservation management
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-3 rounded-xl border bg-card px-2.5 py-2 sm:px-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-foreground">
              {ADMIN_NAME}
            </p>
            <p className="max-w-52 truncate text-xs text-muted-foreground">
              {ADMIN_EMAIL}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
