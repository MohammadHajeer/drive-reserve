import Link from "next/link";
import { BadgeInfo, CarFront, Globe, Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { label: "Browse Cars", href: "/cars" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Sign In", href: "/login" },
  { label: "Create Account", href: "/register" },
];

export function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-slate-300 container-paddings">
      <div className="mx-auto grid max-w-7xl gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="DriveReserve home"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">DriveReserve</span>
          </Link>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            A simple and reliable way to discover available vehicles, compare
            rental options, and reserve the right car for your next journey.
          </p>

          <div className="mt-6 flex gap-3">
            {[
              {
                href: "https://drivereserve.com",
                label: "Website",
                icon: Globe,
              },
              {
                href: "/about",
                label: "About",
                icon: BadgeInfo,
              },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-primary hover:bg-primary hover:text-white"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-white">Quick Links</h2>

          <ul className="mt-5 grid gap-3 text-sm text-slate-400">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Contact</h2>

          <ul className="mt-5 grid gap-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              Beirut, Lebanon
            </li>

            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-primary" />
              +961 1 234 567
            </li>

            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-primary" />
              support@drivereserve.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 container-paddings">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DriveReserve. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="#" className="transition hover:text-slate-300">
              Privacy Policy
            </Link>

            <Link href="#" className="transition hover:text-slate-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
