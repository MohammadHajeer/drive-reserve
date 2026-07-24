"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CarFront,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Reservations", href: "/admin/reservations", icon: CalendarDays },
  { label: "Car Management", href: "/admin/cars", icon: CarFront },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#071A33] text-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600">
              <CarFront className="size-5" />
            </span>
            <div>
              <p className="text-lg font-bold leading-none">DriveReserve</p>
              <p className="mt-1 text-xs text-slate-400">Admin Portal</p>
            </div>
          </Link>
          <button className="rounded-lg p-2 hover:bg-white/10 lg:hidden" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white",
                  active && "bg-blue-600 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-600",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">
            <LogOut className="size-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
