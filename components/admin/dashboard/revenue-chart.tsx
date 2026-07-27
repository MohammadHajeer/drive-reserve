"use client";

import { CircleDollarSign, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RevenueChartItem } from "@/features/admin/dashboard/admin-dashboard.types";

import {
  formatCompactCurrency,
  formatMonth,
  formatWholeCurrency,
} from "./dashboard-formatters";

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--primary)" },
} satisfies ChartConfig;

type RevenueChartProps = {
  data: RevenueChartItem[];
  growthPercentage: number | null;
};

export function RevenueChart({ data, growthPercentage }: RevenueChartProps) {
  const hasRevenue = data.some((item) => item.revenue > 0);
  const TrendIcon = growthPercentage === null || growthPercentage === 0
    ? Minus
    : growthPercentage > 0
      ? TrendingUp
      : TrendingDown;
  const trendLabel = growthPercentage === null
    ? "No previous data"
    : growthPercentage === 0
      ? "No change"
      : `${growthPercentage > 0 ? "+" : ""}${growthPercentage}%`;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue overview</CardTitle>
        <CardDescription>
          Completed reservation revenue during the last six months.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasRevenue ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 12, top: 12 }}>
              <defs>
                <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatMonth}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={55}
                tickFormatter={formatCompactCurrency}
              />
              <ChartTooltip
                cursor={false}
                labelFormatter={(value) => formatMonth(String(value))}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => (
                      <div className="flex min-w-32 items-center justify-between gap-4">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-mono font-medium text-foreground">
                          {formatWholeCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#dashboardRevenueGradient)"
                fillOpacity={0.4}
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <CircleDollarSign className="size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No completed revenue yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Completed reservations in this six-month period will appear here.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-2 text-sm">
        <TrendIcon
          className={
            growthPercentage !== null && growthPercentage > 0
              ? "size-4 text-emerald-600"
              : growthPercentage !== null && growthPercentage < 0
                ? "size-4 text-rose-600"
                : "size-4 text-muted-foreground"
          }
        />
        <span
          className={
            growthPercentage !== null && growthPercentage > 0
              ? "font-medium text-emerald-600"
              : growthPercentage !== null && growthPercentage < 0
                ? "font-medium text-rose-600"
                : "font-medium text-muted-foreground"
          }
        >
          {trendLabel}
        </span>
        <span className="text-muted-foreground">compared with last month</span>
      </CardFooter>
    </Card>
  );
}
