"use client";

import { CalendarX2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ReservationsChartItem } from "@/features/admin/dashboard/admin-dashboard.types";

import { formatMonth } from "./dashboard-formatters";

const chartConfig = {
  completed: { label: "Completed", color: "var(--chart-2)" },
  pending: { label: "Pending", color: "var(--chart-4)" },
  cancelled: { label: "Cancelled", color: "var(--destructive)" },
} satisfies ChartConfig;

export function ReservationsChart({ data }: { data: ReservationsChartItem[] }) {
  const hasReservations = data.some(
    (item) => item.completed > 0 || item.pending > 0 || item.cancelled > 0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation activity</CardTitle>
        <CardDescription>
          Monthly comparison of completed, pending, and cancelled reservations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasReservations ? (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 12, top: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatMonth}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} width={32} />
              <ChartTooltip
                cursor={false}
                labelFormatter={(value) => formatMonth(String(value))}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <CalendarX2 className="size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No reservation activity yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reservation activity in this six-month period will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
