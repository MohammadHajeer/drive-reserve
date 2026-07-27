"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { ReservationsChartItem } from "@/features/admin/dashboard/admin-dashboard.types";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-4)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

type ReservationsChartProps = {
  data: ReservationsChartItem[];
};

export function ReservationsChart({
  data,
}: ReservationsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation activity</CardTitle>

        <CardDescription>
          Monthly comparison of completed, pending, and cancelled
          reservations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={32}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="pending"
              fill="var(--color-pending)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="cancelled"
              fill="var(--color-cancelled)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}