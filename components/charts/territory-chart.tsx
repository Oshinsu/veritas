"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import type { EChartsOption } from "echarts";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([BarChart, LineChart, DatasetComponent, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

export type TerritoryDatum = {
  territory: string;
  spend: number;
  roas: number | null;
};

export function TerritoryChart({ data }: { data: TerritoryDatum[] }) {
  const option = useMemo<EChartsOption>(() => {
    return {
      backgroundColor: "transparent",
      animationDuration: 600,
      dataset: {
        dimensions: ["territory", "spend", "roas"],
        source: data.map((item) => ({
          territory: item.territory,
          spend: Number(item.spend ?? 0),
          roas: item.roas == null ? null : Number(item.roas)
        }))
      },
      grid: { top: 40, left: 48, right: 48, bottom: 32, containLabel: true },
      legend: {
        textStyle: { color: "#cbd5f5", fontSize: 12 }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(12, 22, 38, 0.92)",
        borderColor: "rgba(148, 163, 184, 0.2)",
        textStyle: { color: "#e2e8f0", fontSize: 12 },
        valueFormatter: (value, series) => {
          const seriesName = (series as { seriesName?: string } | undefined)?.seriesName;

          if (seriesName === "ROAS" && typeof value === "number") {
            return `${value.toFixed(2)}x`;
          }
          if (typeof value === "number") {
            return `€${value.toLocaleString("fr-FR")}`;
          }
          return value == null ? "—" : String(value);
        }
      },
      xAxis: {
        type: "category",
        axisLabel: { color: "#cbd5f5" },
        axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.2)" } }
      },
      yAxis: [
        {
          type: "value",
          axisLabel: {
            color: "#cbd5f5",
            formatter: (value: number) => `€${(value / 1000).toFixed(0)}k`
          },
          splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.08)" } }
        },
        {
          type: "value",
          axisLabel: {
            color: "#cbd5f5",
            formatter: (value: number) => `${value.toFixed(1)}x`
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          type: "bar",
          name: "Investissement",
          encode: { x: "territory", y: "spend" },
          itemStyle: {
            borderRadius: [12, 12, 4, 4],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#5C7CFA" },
                { offset: 1, color: "rgba(92, 124, 250, 0.15)" }
              ]
            }
          }
        },
        {
          type: "line",
          name: "ROAS",
          encode: { x: "territory", y: "roas" },
          yAxisIndex: 1,
          smooth: true,
          symbol: "circle",
          symbolSize: 10,
          lineStyle: { width: 3, color: "#4ade80" },
          itemStyle: { color: "#4ade80", borderColor: "#0f172a", borderWidth: 2 }
        }
      ]
    } satisfies EChartsOption;
  }, [data]);

  return (
    <div className="glass-panel h-80 p-6">
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
    </div>
  );
}
