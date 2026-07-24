"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CarFront,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
  },
  {
    label: "Car Management",
    href: "/admin/cars",
    icon: CarFront,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
] as const;

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        throw error;
      }

      onClose();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#071a33] text-white shadow-2xl transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            onClick={onClose}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/30">
              <CarFront className="size-5" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-none">
                DriveReserve
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Admin Portal
              </p>
            </div>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation"
            className="text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Management
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = isActivePath(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors",
                    "hover:bg-white/8 hover:text-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    active &&
                      "bg-blue-600 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-600",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white",
                    )}
                    aria-hidden="true"
                  />

                  <span className="flex-1">{label}</span>

                  {active && (
                    <span
                      className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-white"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <Button
            type="button"
            variant="ghost"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-300 hover:bg-red-500/10 hover:text-red-300"
          >
            {isSigningOut ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <LogOut className="size-5" />
            )}

            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </aside>
    </>
  );
}