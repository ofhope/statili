import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { power } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { ScatterPlot } from "../components/ScatterPlot";
import { StatsPanel } from "../components/StatsPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

const POWER_KEYS: DatasetKey[] = ["power_superlinear","power_diminishing","power_inverse","error_insufficient"];

interface Args { dataset: DatasetKey; precision: number; chartWidth: number; chartHeight: number }

function Demo({ dataset, precision, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const result = power({ precision }, data as DataPoint[]);
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
  title: "Stats / Power Law Regression",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:   { control:{ type:"select" }, options: POWER_KEYS, table:{ category:"Data" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    chartWidth:  { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { precision:3, chartWidth:540, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const SuperlinearGrowth: Story  = { name:"Super-linear Growth (b > 1)",     args:{ dataset:"power_superlinear" } };
export const DiminishingReturns: Story = { name:"Diminishing Returns (0 < b < 1)", args:{ dataset:"power_diminishing" } };
export const InversePowerLaw: Story    = { name:"Inverse Power Law (b < 0)",        args:{ dataset:"power_inverse"     } };
export const ErrorInsufficient: Story  = { name:"Error: Insufficient Data",         args:{ dataset:"error_insufficient"} };
