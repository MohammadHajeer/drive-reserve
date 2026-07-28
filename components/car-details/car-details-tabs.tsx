"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import type { Car } from "@/types/domain";

type CarDetailsTabsProps = {
  description: Car["description"];
  features: Car["features"];
};

type Tab = "overview" | "features";

export function CarDetailsTabs({
  description,
  features,
}: CarDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <nav
          className="flex gap-6"
          aria-label="Car details"
          role="tablist"
        >
          {(["overview", "features"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              id={`car-details-${tab}-tab`}
              aria-controls={`car-details-${tab}-panel`}
              aria-selected={activeTab === tab}
              role="tab"
              className={`pb-3 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" &&
        (description ? (
          <p
            id="car-details-overview-panel"
            role="tabpanel"
            aria-labelledby="car-details-overview-tab"
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        ) : (
          <p
            id="car-details-overview-panel"
            role="tabpanel"
            aria-labelledby="car-details-overview-tab"
            className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground"
          >
            No description is available for this vehicle yet.
          </p>
        ))}

      {activeTab === "features" &&
        (features.length > 0 ? (
          <div
            id="car-details-features-panel"
            role="tabpanel"
            aria-labelledby="car-details-features-tab"
            className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"
          >
            {features.map((feature, index) => (
              <div
                key={`${feature}-${index}`}
                className="flex items-center gap-2 text-foreground"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        ) : (
          <p
            id="car-details-features-panel"
            role="tabpanel"
            aria-labelledby="car-details-features-tab"
            className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground"
          >
            No features have been listed for this vehicle yet.
          </p>
        ))}
    </div>
  );
}
