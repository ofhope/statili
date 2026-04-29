import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { power } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { powerRegressionInsights } from "@statili/forge";
import { ScatterPlot } from "../components/ScatterPlot";
import { InsightPanel } from "../components/InsightPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

const POWER_KEYS: DatasetKey[] = ["power_superlinear","power_diminishing","power_inverse","error_insufficient"];

interface Args {
  dataset: DatasetKey; precision: number;
  rSquaredThresholdWeak: number; rSquaredThresholdStrong: number; nearLinearThreshold: number;
  chartWidth: number; chartHeight: number;
}

function Demo({ dataset, precision, rSquaredThresholdWeak, rSquaredThresholdStrong, nearLinearThreshold, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const stats = power({ precision }, data as DataPoint[]);
  const forge = powerRegressionInsights({ rSquaredThresholdWeak, rSquaredThresholdStrong, nearLinearThreshold }, stats);
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
  title: "Forge / Power Law Insights",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:   { control:{ type:"select" }, options: POWER_KEYS, table:{ category:"Data" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    rSquaredThresholdWeak:   { control:{ type:"range", min:0,    max:0.6, step:0.05 }, table:{ category:"Forge Thresholds" } },
    rSquaredThresholdStrong: { control:{ type:"range", min:0.4,  max:1,   step:0.05 }, table:{ category:"Forge Thresholds" } },
    nearLinearThreshold:     { control:{ type:"range", min:0.01, max:0.5, step:0.01 }, table:{ category:"Forge Thresholds" } },
    chartWidth:  { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { precision:3, rSquaredThresholdWeak:0.3, rSquaredThresholdStrong:0.7, nearLinearThreshold:0.1, chartWidth:540, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const SuperlinearInsight: Story  = { name:"Insight: Super-linear Growth",    args:{ dataset:"power_superlinear" } };
export const DiminishingInsight: Story  = { name:"Insight: Diminishing Returns",    args:{ dataset:"power_diminishing" } };
export const InverseInsight: Story      = { name:"Insight: Inverse Power Law",      args:{ dataset:"power_inverse"     } };
export const ErrorInsufficient: Story   = { name:"Error: Insufficient Data",        args:{ dataset:"error_insufficient"} };
