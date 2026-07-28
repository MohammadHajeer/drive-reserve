import Link from "next/link";
import { SectionHeading } from "@/components/common/section-heading";
import {
    ArrowRight,
  BadgeDollarSign,
  CarFront,
  Crown,
  Minimize2,
  Users,
  Zap,
} from "lucide-react";

const categories = [
  {
    name: "Economy",
    description: "Affordable and fuel-efficient cars for everyday travel.",
    icon: BadgeDollarSign,
  },
  {
    name: "Compact",
    description: "Small and practical cars that are easy to drive and park.",
    icon: Minimize2,
  },
  {
    name: "Sedan",
    description: "Comfortable vehicles for city driving and highway trips.",
    icon: CarFront,
  },
  {
    name: "SUV",
    description: "Spacious vehicles for families and longer journeys.",
    icon: Users,
  },
  {
    name: "Luxury",
    description: "Premium vehicles with refined comfort and advanced features.",
    icon: Crown,
  },
  {
    name: "Electric",
    description:
      "Modern and efficient vehicles powered entirely by electricity.",
    icon: Zap,
  },
];

export function Categories() {
  return (
    <section
      id="categories"
      className="scroll-mt-24 py-20 sm:py-24 container-paddings"
    >
      <div className="mx-auto max-w-7xl">
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
              className="group flex flex-col rounded-2xl border bg-background p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>

              <h3 className="mt-5 text-lg font-bold">{name}</h3>

              <p className="text-sm leading-6 text-muted-foreground mb-3">
                {description}
              </p>

              <div className="mt-auto text-sm font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Browse {name} cars <ArrowRight className="size-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
