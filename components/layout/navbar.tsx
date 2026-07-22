"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, Menu, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "How It Works", href: "/#how-it-works" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setIsOpen(false)}
          aria-label="DriveReserve home"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <CarFront className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Drive<span className="text-primary">Reserve</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/cars"
                  ? pathname.startsWith("/cars")
                  : false;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative py-2 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform hover:text-foreground hover:after:scale-x-100",
                  isActive && "text-foreground after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold hover:bg-muted"
          >
            Sign In
          </Link>
          <Link
            href="/cars"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Browse Cars
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl border bg-card md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="border-t bg-background px-5 py-5 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border bg-card text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/cars"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                Browse Cars
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
