import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { polynomial } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { ScatterPlot } from "../components/ScatterPlot";
import { StatsPanel } from "../components/StatsPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

const POLY_KEYS: DatasetKey[] = ["quadratic_up","quadratic_down","cubic","nonlinear","poly_overfitted"];

interface Args { dataset: DatasetKey; order: number; precision: number; chartWidth: number; chartHeight: number }

function Demo({ dataset, order, precision, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const result = polynomial({ precision, order }, data as DataPoint[]);
  return (
    <div style={{ display:"flex", gap:24, alignItems:"flex-start", fontFamily:"system-ui,sans-serif" }}>
      <div>
        <p style={{ margin:"0 0 10px", color:"#6b7280", fontSize:13, maxWidth:chartWidth }}>{description}</p>
        <ScatterPlot data={data as DataPoint[]} result={result} width={chartWidth} height={chartHeight} />
      </div>
      <StatsPanel result={result} />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Stats / Polynomial Regression",
  component: Demo,
  parameters: { layout: "padded" },
  argTypes: {
    dataset: { control: { type:"select" }, options: POLY_KEYS, table:{ category:"Data" } },
    order:     { control: { type:"range", min:1, max:6, step:1 }, description:"Polynomial degree", table:{ category:"Options" } },
    precision: { control: { type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    chartWidth:  { control: { type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control: { type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { order:2, precision:2, chartWidth:540, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const QuadraticUpward: Story    = { name:"Quadratic — Upward Parabola",         args:{ dataset:"quadratic_up",   order:2 } };
export const QuadraticDownward: Story  = { name:"Quadratic — Downward Parabola",        args:{ dataset:"quadratic_down", order:2 } };
export const CubicSCurve: Story        = { name:"Cubic — S-Curve",                      args:{ dataset:"cubic",          order:3 } };
export const LinearVsQuadratic: Story  = { name:"Linear vs Quadratic (use Controls)",   args:{ dataset:"nonlinear",      order:1 } };
export const OverfitRisk: Story        = { name:"Overfit Risk (few points, high degree)",args:{ dataset:"poly_overfitted",order:2 } };
export const ErrorInsufficientData: Story = { name:"Error: Insufficient Data",           args:{ dataset:"poly_overfitted",order:5 } };
