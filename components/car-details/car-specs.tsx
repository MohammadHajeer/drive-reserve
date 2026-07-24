import { CalendarDays, Fuel, Gauge, Users } from "lucide-react";

import type { Car } from "@/types/domain";

type CarSpecsProps = {
  year: Car["year"];
  transmission: Car["transmission"];
  fuelType: Car["fuel_type"];
  seats: Car["seats"];
};

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function CarSpecs({
  year,
  transmission,
  fuelType,
  seats,
}: CarSpecsProps) {
  const specs = [
    {
      label: "Model year",
      value: String(year),
      icon: <CalendarDays className="h-4 w-4 text-primary" />,
    },
    {
      label: "Transmission",
      value: titleCase(transmission),
      icon: <Gauge className="h-4 w-4 text-primary" />,
    },
    {
      label: "Fuel type",
      value: titleCase(fuelType),
      icon: <Fuel className="h-4 w-4 text-primary" />,
    },
    {
      label: "Passengers",
      value: `${seats} people`,
      icon: <Users className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="rounded-xl border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {spec.icon}
            <span>{spec.label}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
