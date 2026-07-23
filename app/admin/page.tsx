import Link from "next/link";
import { CalendarCheck, CarFront, CircleDollarSign, Users } from "lucide-react";

const stats = [
  { label: "Total Fleet", value: "—", icon: CarFront },
  { label: "Active Reservations", value: "—", icon: CalendarCheck },
  { label: "Customers", value: "—", icon: Users },
  { label: "Monthly Revenue", value: "—", icon: CircleDollarSign },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">Monitor fleet, reservations, customers, and platform activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="size-6" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Quick actions</h2>
        <p className="mt-1 text-sm text-slate-500">Start with the fleet management workspace assigned in Jira.</p>
        <Link href="/admin/cars" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Open Car Management
        </Link>
      </section>
    </div>
  );
}
