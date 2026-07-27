"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

type DashboardKpiCardProps = {
  title: string;
  value: string;
  description: string;
  href: string;
  icon: LucideIcon;
  trend?: number | null;
};

export function DashboardKpiCard({
  title,
  value,
  description,
  href,
  icon: Icon,
  trend,
}: DashboardKpiCardProps) {
  const router = useRouter();
  const TrendIcon = trend === null || trend === 0
    ? Minus
    : trend !== undefined && trend < 0
      ? ArrowDownRight
      : TrendingUp;
  const trendLabel = trend === null
    ? "No previous data"
    : trend === 0
      ? "No change"
      : trend !== undefined
        ? `${trend > 0 ? "+" : ""}${trend}%`
        : null;

  return (
    <Card
      role="link"
      tabIndex={0}
      className="group cursor-pointer transition-colors hover:border-primary/40"
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>

          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trendLabel ? (
            <span
              className={
                trend !== null && trend !== undefined && trend > 0
                  ? "flex items-center gap-1 font-medium text-emerald-600"
                  : trend !== null && trend !== undefined && trend < 0
                    ? "flex items-center gap-1 font-medium text-rose-600"
                    : "flex items-center gap-1 font-medium text-muted-foreground"
              }
            >
              <TrendIcon className="size-3.5" />
              {trendLabel}
            </span>
          ) : null}

          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}
