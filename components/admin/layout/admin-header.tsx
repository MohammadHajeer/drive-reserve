"use client";

import { Bell, Menu, Search } from "lucide-react";

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        className="mr-3 rounded-xl border p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="h-10 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search the admin portal..."
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-xl border p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-blue-600" />
        </button>
        <div className="flex items-center gap-3 rounded-xl border px-3 py-2">
          <div className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">AD</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">Administrator</p>
            <p className="text-xs text-slate-500">admin@drivereserve.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
