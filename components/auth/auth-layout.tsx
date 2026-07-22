import { cn } from "@/lib/utils";

import { AuthBrandPanel } from "./auth-brand-panel";

type AuthLayoutProps = {
  children: React.ReactNode;
  wide?: boolean;
};

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-background xl:grid xl:grid-cols-2">
      <AuthBrandPanel />
      <section className="flex min-h-svh min-w-0 items-center justify-center overflow-x-hidden px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
        <div className={cn("w-full", wide ? "max-w-xl" : "max-w-md")}>
          {children}
        </div>
      </section>
    </div>
  );
}
