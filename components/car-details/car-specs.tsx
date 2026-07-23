import React from "react";
import { Gauge, Fuel, Zap, Users } from "lucide-react";
import { CarSpec } from "@/lib/mock-car-details";

interface CarSpecsProps {
  specs: CarSpec[];
}

export function CarSpecs({ specs }: CarSpecsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "transmission":
        return <Gauge className="h-4 w-4 text-primary" />;
      case "fuel":
        return <Fuel className="h-4 w-4 text-primary" />;
      case "horsepower":
        return <Zap className="h-4 w-4 text-primary" />;
      case "passengers":
        return <Users className="h-4 w-4 text-primary" />;
      default:
        return <Gauge className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {specs.map((spec, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {getIcon(spec.iconName)}
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