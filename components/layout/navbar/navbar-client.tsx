"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { APP_ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type NavbarUser = {
  id: string;
  email: string | null;
  role: "customer" | "admin";
};

const navigation = [
  {
    label: "Home",
    href: APP_ROUTES.home,
  },
  {
    label: "Cars",
    href: APP_ROUTES.cars,
  },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

function getUserInitial(email: string | null) {
  return email?.charAt(0).toUpperCase() || "U";
}

export function NavbarClient() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>();
  const { logout, isLoggingOut } = useLogout();

  const isHomePage = pathname === APP_ROUTES.home;
  const isTransparent = isHomePage && !isScrolled && !isOpen;

  const dashboardHref =
    user?.role === "admin"
      ? APP_ROUTES.admin
      : APP_ROUTES.customerReservations;

  const dashboardLabel =
    user?.role === "admin" ? "Admin dashboard" : "My reservations";

  const DashboardIcon = user?.role === "admin" ? LayoutDashboard : CalendarDays;

  async function handleLogout() {
    setIsOpen(false);

    if (await logout()) {
      setUser(null);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getClaims();

      if (!isMounted) return;

      const claims = data?.claims;

      setUser(
        !error && typeof claims?.sub === "string"
          ? {
              id: claims.sub,
              email: typeof claims.email === "string" ? claims.email : null,
              role: claims.user_role === "admin" ? "admin" : "customer",
            }
          : null,
      );
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 container-paddings",
          isTransparent
            ? "border-b border-transparent bg-transparent"
            : [
                "border-b border-border/70 bg-background/90",
                "backdrop-blur-xl supports-backdrop-filter:bg-background/80",
              ],
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between ">
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="DriveReserve home"
            className="group inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-transform duration-200 group-hover:-translate-y-0.5">
              <CarFront className="size-5" aria-hidden="true" />
            </span>

            <span
              className={cn(
                "text-lg font-bold tracking-tight transition-colors",
                isTransparent ? "text-white" : "text-foreground",
              )}
            >
              Drive
              <span
                className={isTransparent ? "text-blue-400" : "text-primary"}
              >
                Reserve
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const isActive = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    isTransparent
                      ? "text-white/70 hover:bg-white/10 hover:text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isActive &&
                      (isTransparent
                        ? "bg-white/10 text-white"
                        : "bg-primary/10 text-primary"),
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user === undefined ? (
              <DesktopAuthActionsSkeleton isTransparent={isTransparent} />
            ) : user ? (
              <AuthenticatedActions
                user={user}
                dashboardHref={dashboardHref}
                dashboardLabel={dashboardLabel}
                DashboardIcon={DashboardIcon}
                isTransparent={isTransparent}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            ) : (
              <GuestActions isTransparent={isTransparent} />
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-xl border transition-colors md:hidden",
              isTransparent
                ? "border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/15"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {isOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          />

          <div
            id="mobile-navigation"
            className="fixed inset-x-4 top-21 z-60 overflow-hidden rounded-2xl border bg-background/95 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:hidden"
          >
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const isActive = isRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {user === undefined ? (
              <MobileAuthActionsSkeleton />
            ) : user ? (
              <MobileAuthenticatedActions
                user={user}
                dashboardHref={dashboardHref}
                dashboardLabel={dashboardLabel}
                DashboardIcon={DashboardIcon}
                closeMenu={closeMenu}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            ) : (
              <MobileGuestActions closeMenu={closeMenu} />
            )}
          </div>
        </>
      )}

      {!isHomePage && <div className="h-18" aria-hidden="true" />}
    </>
  );
}

function DesktopAuthActionsSkeleton({
  isTransparent,
}: {
  isTransparent: boolean;
}) {
  return (
    <div
      aria-label="Checking session"
      className={cn(
        "h-10 w-44 animate-pulse rounded-full",
        isTransparent ? "bg-white/10" : "bg-muted",
      )}
    />
  );
}

function MobileAuthActionsSkeleton() {
  return (
    <div
      aria-label="Checking session"
      className="mt-3 h-11 animate-pulse rounded-xl border-t bg-muted"
    />
  );
}

function GuestActions({ isTransparent }: { isTransparent: boolean }) {
  return (
    <>
      <Link
        href={APP_ROUTES.login}
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "h-10 rounded-lg px-4 font-semibold",
          isTransparent && "text-white hover:bg-white/10 hover:text-white",
        )}
      >
        <LogIn data-icon="inline-start" className="size-4" aria-hidden="true" />
        Sign in
      </Link>

      <Link
        href={APP_ROUTES.cars}
        className={cn(
          buttonVariants({ size: "sm" }),
          "h-10 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-5 font-semibold text-white",
          "shadow-lg shadow-blue-500/20 transition-all duration-200",
          "hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30",
        )}
      >
        Browse cars
        <ArrowRight
          data-icon="inline-end"
          className="size-4"
          aria-hidden="true"
        />
      </Link>
    </>
  );
}

function AuthenticatedActions({
  user,
  dashboardHref,
  dashboardLabel,
  DashboardIcon,
  isTransparent,
  isLoggingOut,
  onLogout,
}: {
  user: NavbarUser;
  dashboardHref: string;
  dashboardLabel: string;
  DashboardIcon: typeof LayoutDashboard;
  isTransparent: boolean;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
}) {
  return (
    <>
      <Link
        href={dashboardHref}
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "h-10 rounded-lg px-4 font-semibold",
          isTransparent
            ? "text-white hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <DashboardIcon
          data-icon="inline-start"
          className="size-4"
          aria-hidden="true"
        />
        {dashboardLabel}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Open profile menu"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                }),
                "h-10 rounded-full py-1 pr-2 pl-1.5",
                isTransparent &&
                  "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white",
              )}
            />
          }
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {getUserInitial(user.email)}
          </span>

          <span className="max-w-28 truncate">
            {user.email?.split("@")[0] || "Profile"}
          </span>

          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 rounded-xl"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs text-muted-foreground">Signed in as</p>

              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {user.email || "DriveReserve user"}
              </p>

              <p className="mt-1 text-xs capitalize text-muted-foreground">
                {user.role}
              </p>
            </DropdownMenuLabel>

            {user.role === "admin" ? (
              <DropdownMenuItem render={<Link href={APP_ROUTES.admin} />}>
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Admin dashboard
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                render={<Link href={APP_ROUTES.customerProfile} />}
              >
                <UserRound className="size-4" aria-hidden="true" />
                Account
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            onClick={() => void onLogout()}
          >
            <LogOut className="size-4" aria-hidden="true" />

            {isLoggingOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function MobileGuestActions({ closeMenu }: { closeMenu: () => void }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-4">
      <Link
        href={APP_ROUTES.login}
        onClick={closeMenu}
        className={cn(
          buttonVariants({
            variant: "outline",
          }),
          "h-11 rounded-xl font-semibold",
        )}
      >
        Sign in
      </Link>

      <Link
        href={APP_ROUTES.cars}
        onClick={closeMenu}
        className={cn(
          buttonVariants(),
          "h-11 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 font-semibold text-white",
        )}
      >
        Browse cars
      </Link>
    </div>
  );
}

function MobileAuthenticatedActions({
  user,
  dashboardHref,
  dashboardLabel,
  DashboardIcon,
  closeMenu,
  isLoggingOut,
  onLogout,
}: {
  user: NavbarUser;
  dashboardHref: string;
  dashboardLabel: string;
  DashboardIcon: typeof LayoutDashboard;
  closeMenu: () => void;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
}) {
  const isCustomer = user.role === "customer";

  return (
    <div className="mt-3 border-t pt-4">
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted/70 p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {getUserInitial(user.email)}
        </span>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Signed in as</p>

          <p className="truncate text-sm font-semibold text-foreground">
            {user.email || "DriveReserve user"}
          </p>

          <p className="text-xs capitalize text-muted-foreground">
            {user.role}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={dashboardHref}
          onClick={closeMenu}
          className={cn(buttonVariants(), "h-11 rounded-xl font-semibold")}
        >
          <DashboardIcon
            data-icon="inline-start"
            className="size-4"
            aria-hidden="true"
          />
          {dashboardLabel}
        </Link>

        {isCustomer && (
          <Link
            href={APP_ROUTES.customerProfile}
            onClick={closeMenu}
            className={cn(
              buttonVariants({
                variant: "outline",
              }),
              "h-11 rounded-xl font-semibold",
            )}
          >
            <UserRound
              data-icon="inline-start"
              className="size-4"
              aria-hidden="true"
            />
            Account
          </Link>
        )}

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => void onLogout()}
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
            "h-11 rounded-xl font-semibold text-destructive hover:text-destructive",
            isCustomer && "sm:col-span-2",
          )}
        >
          <LogOut
            data-icon="inline-start"
            className="size-4"
            aria-hidden="true"
          />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}
