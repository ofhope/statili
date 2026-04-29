import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { logarithmic } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { logarithmicRegressionInsights } from "@statili/forge";
import { ScatterPlot } from "../components/ScatterPlot";
import { InsightPanel } from "../components/InsightPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

const LOG_KEYS: DatasetKey[] = ["log_growth","log_decay","error_vertical"];

interface Args {
  dataset: DatasetKey; precision: number;
  rSquaredThresholdWeak: number; rSquaredThresholdStrong: number;
  chartWidth: number; chartHeight: number;
}

function Demo({ dataset, precision, rSquaredThresholdWeak, rSquaredThresholdStrong, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const stats = logarithmic({ precision }, data as DataPoint[]);
  const forge = logarithmicRegressionInsights({ rSquaredThresholdWeak, rSquaredThresholdStrong }, stats);
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
  title: "Forge / Logarithmic Regression Insights",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:   { control:{ type:"select" }, options: LOG_KEYS, table:{ category:"Data" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    rSquaredThresholdWeak:   { control:{ type:"range", min:0,   max:0.6, step:0.05 }, table:{ category:"Forge Thresholds" } },
    rSquaredThresholdStrong: { control:{ type:"range", min:0.4, max:1,   step:0.05 }, table:{ category:"Forge Thresholds" } },
    chartWidth:  { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { precision:2, rSquaredThresholdWeak:0.3, rSquaredThresholdStrong:0.7, chartWidth:540, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const GrowthInsights: Story    = { name:"Insight: Logarithmic Growth",          args:{ dataset:"log_growth"    } };
export const DecayInsights: Story     = { name:"Insight: Logarithmic Decay",           args:{ dataset:"log_decay"     } };
export const ErrorDegenerate: Story   = { name:"Error: Degenerate Input (identical x)",args:{ dataset:"error_vertical"} };
