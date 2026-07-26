"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CarFront, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
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

export function CustomerNavigation({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href={APP_ROUTES.home}
            aria-label="DriveReserve home"
            className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/20">
              <CarFront className="size-4.5" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight">
              Drive<span className="text-primary">Reserve</span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:block">
              {email}
            </span>
            <LogoutButton compact />
          </div>
        </div>

        <nav
          aria-label="Customer account navigation"
          className="-mx-1 flex gap-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {accountLinks.map((item) => {
            const isActive =
              item.href !== APP_ROUTES.cars && pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "shrink-0 rounded-xl text-muted-foreground",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                )}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

