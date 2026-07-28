import Image from "next/image";
import { BadgeCheck, ShieldCheck } from "lucide-react";

import { AuthLogo } from "./auth-logo";

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden h-svh overflow-hidden bg-slate-950 xl:sticky xl:top-0 xl:block">
      <div className="absolute inset-0">
        <Image
          src="/auth-automotive.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 50vw, 0vw"
          className="object-cover object-[center_72%]"
        />
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-slate-950/30 to-slate-950/85" />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/40 via-transparent to-slate-950/10" />
      </div>

      <div className="relative flex h-full flex-col p-10 text-white xl:p-14 2xl:p-16">
        <AuthLogo inverse />

        <div className="my-auto max-w-lg pb-16 pt-20">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">
            DriveReserve
          </p>
          <h2 className="text-4xl font-bold leading-[1.08] tracking-tight xl:text-5xl 2xl:text-6xl">
            Drive with confidence. Reserve with ease.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-200 xl:text-lg xl:leading-8">
            Browse available vehicles, compare rental options, and reserve your
            next car with a secure, dependable experience.
          </p>

          <div className="mt-9 flex flex-wrap gap-3 text-sm text-slate-100">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <ShieldCheck
                className="size-4 text-blue-300"
                aria-hidden="true"
              />
              Secure reservations
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <BadgeCheck
                className="size-4 text-emerald-300"
                aria-hidden="true"
              />
              Verified vehicles
            </div>
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Your journey starts here
        </p>
      </div>
    </aside>
  );
}
