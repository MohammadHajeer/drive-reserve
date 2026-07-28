import Link from "next/link";
import { CarFront } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthLogoProps = {
  className?: string;
  inverse?: boolean;
};

export function AuthLogo({ className, inverse = false }: AuthLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4",
        inverse && "focus-visible:ring-white focus-visible:ring-offset-slate-950",
        className,
      )}
      aria-label="DriveReserve home"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-blue-950/20">
        <CarFront className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight text-foreground",
          inverse && "text-white",
        )}
      >
        DriveReserve
      </span>
    </Link>
  );
}
