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
        <p className="text-sm font-semibold text-primary">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Monitor fleet, reservations, customers, and platform activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start with the fleet management workspace assigned in Jira.</p>
        <Link href="/admin/cars" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Open Car Management
        </Link>
      </section>
    </div>
  );
}
