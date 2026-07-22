import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Fuel,
  Gauge,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const featuredCars = [
  {
    name: "Mercedes-Benz C-Class",
    category: "Premium Sedan",
    price: 95,
    transmission: "Automatic",
    seats: 5,
    fuel: "Petrol",
    accent: "from-blue-600 to-sky-400",
  },
  {
    name: "BMW X5",
    category: "Luxury SUV",
    price: 135,
    transmission: "Automatic",
    seats: 5,
    fuel: "Hybrid",
    accent: "from-slate-800 to-slate-500",
  },
  {
    name: "Toyota Corolla",
    category: "Economy",
    price: 48,
    transmission: "Automatic",
    seats: 5,
    fuel: "Petrol",
    accent: "from-cyan-600 to-blue-400",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background ">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CarFront className="size-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-foreground">
                Drive<span className="text-primary">Reserve</span>
              </p>
              <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Car rental
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link
              href="#vehicles"
              className="transition-colors hover:text-foreground"
            >
              Vehicles
            </Link>
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="#benefits"
              className="transition-colors hover:text-foreground"
            >
              Why DriveReserve
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              href="/cars"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Browse cars
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative border-b">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-32 size-150 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-40 bottom-0 size-125 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              Simple, secure and flexible car rental
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              Your next journey starts with the{" "}
              <span className="text-primary">right car.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Browse reliable vehicles, choose your rental period and reserve
              your car through one clear and convenient platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cars"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Explore available cars
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-xl border bg-card px-6 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Transparent pricing
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Verified vehicles
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Secure reservations
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border bg-card p-5 shadow-2xl shadow-slate-900/10 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-36 bg-linear-to-b from-primary/10 to-transparent" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Quick reservation
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight">
                      Find your perfect car
                    </h2>
                  </div>

                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Search className="size-5" />
                  </div>
                </div>

                <form className="grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold">
                    Pickup location
                    <div className="flex h-12 items-center gap-3 rounded-xl border bg-background px-4">
                      <MapPin className="size-4 text-primary" />
                      <input
                        type="text"
                        placeholder="Select a location"
                        className="w-full bg-transparent text-sm font-normal outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold">
                      Pickup date
                      <div className="flex h-12 items-center gap-3 rounded-xl border bg-background px-4">
                        <CalendarDays className="size-4 text-primary" />
                        <input
                          type="date"
                          className="w-full bg-transparent text-sm font-normal outline-none"
                        />
                      </div>
                    </label>

                    <label className="grid gap-2 text-sm font-semibold">
                      Return date
                      <div className="flex h-12 items-center gap-3 rounded-xl border bg-background px-4">
                        <CalendarDays className="size-4 text-primary" />
                        <input
                          type="date"
                          className="w-full bg-transparent text-sm font-normal outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  <button
                    type="button"
                    className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
                  >
                    <Search className="size-4" />
                    Search available cars
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                  <span>Price is calculated by rental duration</span>
                  <span className="font-semibold text-foreground">
                    No hidden fees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y px-5 sm:grid-cols-4 sm:divide-y-0 sm:px-8 lg:px-10">
          {[
            ["50+", "Available cars"],
            ["10+", "Vehicle categories"],
            ["24/7", "Reservation access"],
            ["100%", "Transparent pricing"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="flex flex-col items-center px-4 py-7 text-center"
            >
              <p className="text-2xl font-bold tracking-tight text-primary">
                {value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="vehicles"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">
              Featured vehicles
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Find a car for every journey
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              From affordable everyday vehicles to premium cars for special
              trips.
            </p>
          </div>

          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View all vehicles
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCars.map((car) => (
            <article
              key={car.name}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`relative flex h-52 items-center justify-center overflow-hidden bg-linear-to-br ${car.accent}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_45%)]" />

                <CarFront className="relative size-28 text-white drop-shadow-xl transition-transform duration-300 group-hover:scale-105" />

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
                  {car.category}
                </span>

                <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  <Star className="size-3 fill-current text-amber-400" />
                  4.9
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{car.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Free cancellation available
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${car.price}
                    </p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-y py-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="size-4 text-primary" />
                    {car.transmission}
                  </div>

                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="size-4 text-primary" />
                    {car.seats} seats
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <Fuel className="size-4 text-primary" />
                    {car.fuel}
                  </div>
                </div>

                <Link
                  href="/cars"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  View car details
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Reserve your car in three simple steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Choose your dates",
                description:
                  "Select your preferred pickup and return dates to see available vehicles.",
                icon: CalendarDays,
              },
              {
                number: "02",
                title: "Select a vehicle",
                description:
                  "Compare prices, specifications and categories to find the right car.",
                icon: CarFront,
              },
              {
                number: "03",
                title: "Confirm reservation",
                description:
                  "Review the calculated price and submit your reservation securely.",
                icon: CheckCircle2,
              },
            ].map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="relative rounded-2xl border bg-background p-6"
                >
                  <span className="absolute right-5 top-4 text-4xl font-bold text-primary/10">
                    {step.number}
                  </span>

                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10"
      >
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold text-primary">Why DriveReserve</p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            A smoother rental experience from search to return
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
            DriveReserve keeps availability, pricing and reservations organized
            in one place for both customers and administrators.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              "Availability is checked for the selected rental period.",
              "Rental prices are calculated automatically by duration.",
              "Customers can review and track their reservations.",
              "Administrators can manage vehicles and rental operations.",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" />
                </div>
                <p className="text-sm leading-6 text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-foreground p-7 text-background sm:p-10">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/30 blur-3xl" />

          <div className="relative">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-primary text-white">
              <ShieldCheck className="size-6" />
            </div>

            <h3 className="mt-7 max-w-md text-3xl font-bold tracking-tight">
              Reserve confidently with clear pricing and reliable availability.
            </h3>

            <p className="mt-4 max-w-lg leading-7 text-background/70">
              The total amount is based on the selected rental duration, while
              conflicting reservations are blocked automatically.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">3 days</p>
                <p className="mt-1 text-sm text-white/60">Rental duration</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">$285</p>
                <p className="mt-1 text-sm text-white/60">
                  Automatically calculated
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <CarFront className="size-5 text-primary" />
            DriveReserve
          </div>

          <p>Car Rental and Reservation System</p>

          <p>© 2026 DriveReserve</p>
        </div>
      </footer>
    </main>
  );
}
