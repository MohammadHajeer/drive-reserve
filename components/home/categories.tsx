import Link from "next/link";
import {
  CarFront,
  Crown,
  Gauge,
  Leaf,
  Sparkles,
  Users,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";

const categories = [
  {
    name: "Economy",
    description: "Affordable cars for everyday travel.",
    icon: Leaf,
  },
  {
    name: "Sedan",
    description: "Comfortable vehicles for city and highway trips.",
    icon: CarFront,
  },
  {
    name: "SUV",
    description: "Spacious vehicles for families and longer journeys.",
    icon: Users,
  },
  {
    name: "Luxury",
    description: "Premium cars with comfort and refined features.",
    icon: Crown,
  },
  {
    name: "Sports",
    description: "Performance-focused cars for an exciting drive.",
    icon: Gauge,
  },
  {
    name: "Electric",
    description: "Modern and efficient electric vehicles.",
    icon: Sparkles,
  },
];

export function Categories() {
  return (
    <section
      id="categories"
      className="scroll-mt-24 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Browse by category"
          title="Find the right type of car"
          description="Explore vehicles by category and choose the option that fits your trip."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ name, description, icon: Icon }) => (
            <Link
              key={name}
              href={`/cars?category=${encodeURIComponent(name)}`}
              className="group rounded-2xl border bg-background p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>

              <h3 className="mt-5 text-lg font-bold">{name}</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-primary">
                Browse {name} cars
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}