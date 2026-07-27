"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CarFront, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const accountLinks = [
  {
    href: APP_ROUTES.customerReservations,
    label: "My Reservations",
    icon: CalendarDays,
  },
  {
    href: APP_ROUTES.customerProfile,
    label: "Profile",
    icon: UserRound,
  },
  {
    href: APP_ROUTES.cars,
    label: "Browse Cars",
    icon: CarFront,
  },
] as const;

type CustomerNavigationProps = {
  email: string | null;
};

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerNavigation({
  email,
}: CustomerNavigationProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href={APP_ROUTES.home}
            aria-label="Go to the DriveReserve home page"
            className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:-translate-y-0.5">
              <CarFront className="size-5" aria-hidden="true" />
            </span>

            <span className="text-lg font-bold tracking-tight">
              Drive
              <span className="text-primary">Reserve</span>
            </span>
          </Link>

          <DesktopNavigation pathname={pathname} />

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <div
              className="hidden min-w-0 items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 lg:flex"
              title={email ?? "Customer account"}
            >
              <UserRound
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <span className="max-w-48 truncate text-sm text-muted-foreground">
                {email ?? "Customer account"}
              </span>
            </div>

            <ThemeToggle />
            <LogoutButton compact />
          </div>
        </div>

        <MobileNavigation pathname={pathname} />
      </div>
    </header>
  );
}

function DesktopNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Customer account navigation"
      className="hidden flex-1 items-center justify-center gap-1 md:flex"
    >
      {accountLinks.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "h-9 rounded-full px-3.5 text-muted-foreground transition-all duration-200",
              "hover:bg-muted hover:text-foreground",
              isActive &&
                "bg-primary/10 text-primary shadow-sm hover:bg-primary/15 hover:text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Customer account navigation"
      className="-mx-1 flex gap-1 overflow-x-auto pb-3 md:hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {accountLinks.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "h-9 shrink-0 rounded-full px-3 text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              isActive &&
                "bg-primary/10 text-primary shadow-sm hover:bg-primary/15 hover:text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
