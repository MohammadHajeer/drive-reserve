import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

import { AuthBrandPanel } from "./auth-brand-panel";

type AuthLayoutProps = {
  children: React.ReactNode;
  wide?: boolean;
};

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-background xl:grid xl:grid-cols-2">
      <AuthBrandPanel />
      <section className="relative flex min-h-svh min-w-0 items-center justify-center overflow-x-hidden px-5 py-16 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <ThemeToggle className="absolute right-5 top-5 sm:right-8 sm:top-8" />
        <div className={cn("w-full", wide ? "max-w-xl" : "max-w-md")}>
          {children}
        </div>
      </section>
    </div>
  );
}
