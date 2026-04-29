import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { polynomial } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { polynomialRegressionInsights } from "@statili/forge";
import { ScatterPlot } from "../components/ScatterPlot";
import { InsightPanel } from "../components/InsightPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

const POLY_KEYS: DatasetKey[] = ["quadratic_up","quadratic_down","cubic","nonlinear","poly_overfitted"];

interface Args {
  dataset: DatasetKey; order: number; precision: number;
  rSquaredThresholdWeak: number; rSquaredThresholdStrong: number; overfitRatioThreshold: number;
  chartWidth: number; chartHeight: number;
}

function Demo({ dataset, order, precision, rSquaredThresholdWeak, rSquaredThresholdStrong, overfitRatioThreshold, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const stats  = polynomial({ precision, order }, data as DataPoint[]);
  const forge  = polynomialRegressionInsights({ rSquaredThresholdWeak, rSquaredThresholdStrong, overfitRatioThreshold }, stats);
  return (
    <div style={{ display:"flex", gap:24, alignItems:"flex-start", fontFamily:"system-ui,sans-serif" }}>
      <div>
        <p style={{ margin:"0 0 10px", color:"#6b7280", fontSize:13, maxWidth:chartWidth }}>{description}</p>
        <ScatterPlot data={data as DataPoint[]} result={stats} width={chartWidth} height={chartHeight} />
      </div>
      <InsightPanel result={forge} />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Forge / Polynomial Regression Insights",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset: { control:{ type:"select" }, options: POLY_KEYS, table:{ category:"Data" } },
    order:     { control:{ type:"range", min:1, max:6, step:1 }, table:{ category:"Options" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    rSquaredThresholdWeak:   { control:{ type:"range", min:0,   max:0.6, step:0.05 }, table:{ category:"Forge Thresholds" } },
    rSquaredThresholdStrong: { control:{ type:"range", min:0.4, max:1,   step:0.05 }, table:{ category:"Forge Thresholds" } },
    overfitRatioThreshold:   { control:{ type:"range", min:0.1, max:0.8, step:0.05 }, table:{ category:"Forge Thresholds" } },
    chartWidth:  { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { order:2, precision:2, rSquaredThresholdWeak:0.3, rSquaredThresholdStrong:0.7, overfitRatioThreshold:0.33, chartWidth:540, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const QuadraticUpward: Story   = { name:"Insight: Upward Parabola",        args:{ dataset:"quadratic_up",   order:2 } };
export const QuadraticDownward: Story = { name:"Insight: Downward Parabola",       args:{ dataset:"quadratic_down", order:2 } };
export const CubicSCurve: Story       = { name:"Insight: Cubic S-Curve",           args:{ dataset:"cubic",          order:3 } };
export const OverfitWarning: Story    = { name:"Insight: Overfit Warning",          args:{ dataset:"poly_overfitted",order:4 } };
export const ErrorInsufficient: Story = { name:"Error: Insufficient Data",          args:{ dataset:"poly_overfitted",order:5 } };
