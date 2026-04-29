import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { logarithmic } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { ScatterPlot } from "../components/ScatterPlot";
import { StatsPanel } from "../components/StatsPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

const LOG_KEYS: DatasetKey[] = ["log_growth","log_decay","error_vertical"];

interface Args { dataset: DatasetKey; precision: number; chartWidth: number; chartHeight: number }

function Demo({ dataset, precision, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const result = logarithmic({ precision }, data as DataPoint[]);
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
  title: "Stats / Logarithmic Regression",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:   { control:{ type:"select" }, options: LOG_KEYS, table:{ category:"Data" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    chartWidth:  { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { precision:2, chartWidth:540, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const LogarithmicGrowth: Story  = { name:"Logarithmic Growth (b > 0)",             args:{ dataset:"log_growth"    } };
export const LogarithmicDecay: Story   = { name:"Logarithmic Decay (b < 0)",              args:{ dataset:"log_decay"     } };
export const ErrorDegenerate: Story    = { name:"Error: Degenerate Input (identical x)",  args:{ dataset:"error_vertical"} };
