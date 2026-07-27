"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { RevenueChartItem } from "@/features/admin/dashboard/admin-dashboard.types";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type RevenueChartProps = {
  data: RevenueChartItem[];
  growthPercentage: number;
};

export function RevenueChart({
  data,
  growthPercentage,
}: RevenueChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue overview</CardTitle>

        <CardDescription>
          Revenue generated from reservations during the last six months.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 12,
              top: 12,
            }}
          >
            <defs>
              <linearGradient
                id="dashboardRevenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={55}
              tickFormatter={(value: number) =>
                `$${Math.round(value / 1000)}k`
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => (
                    <div className="flex min-w-32 items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        Revenue
                      </span>

                      <span className="font-mono font-medium text-foreground">
                        {Number(value).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}
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
      </CardContent>

      <CardFooter className="flex items-center gap-2 text-sm">
        <TrendingUp className="size-4 text-emerald-600" />

        <span className="font-medium text-emerald-600">
          {growthPercentage >= 0 ? "+" : ""}
          {growthPercentage}%
        </span>

        <span className="text-muted-foreground">
          compared with last month
        </span>
      </CardFooter>
    </Card>
  );
}