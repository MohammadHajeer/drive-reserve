"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

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

import type { FleetStatusChartItem } from "@/features/admin/dashboard/admin-dashboard.types";

const chartConfig = {
  count: {
    label: "Cars",
  },
  available: {
    label: "Available",
    color: "var(--chart-2)",
  },
  reserved: {
    label: "Reserved",
    color: "var(--primary)",
  },
  maintenance: {
    label: "Maintenance",
    color: "var(--chart-4)",
  },
  inactive: {
    label: "Inactive",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

type FleetStatusChartProps = {
  data: FleetStatusChartItem[];
};

export function FleetStatusChart({
  data,
}: FleetStatusChartProps) {
  const totalCars = data.reduce(
    (total, item) => total + item.count,
    0
  );

  const chartData = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.status})`,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet status</CardTitle>

        <CardDescription>
          Current availability and condition of your vehicles.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[300px] w-full"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="status"
                />
              }
            />

            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={68}
              outerRadius={98}
              strokeWidth={4}
            >
              {chartData.map((item) => (
                <Cell
                  key={item.status}
                  fill={item.fill}
                />
              ))}

              <Label
                content={({ viewBox }) => {
                  if (
                    !viewBox ||
                    !("cx" in viewBox) ||
                    !("cy" in viewBox)
                  ) {
                    return null;
                  }

                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalCars.toLocaleString("en-US")}
                      </tspan>

                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 24}
                        className="fill-muted-foreground text-sm"
                      >
                        Total cars
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>

            <ChartLegend
              content={
                <ChartLegendContent
                  nameKey="status"
                  className="flex-wrap"
                />
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}