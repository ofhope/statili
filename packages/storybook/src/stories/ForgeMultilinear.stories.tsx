import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { multilinear } from "@statili/stats";
import type { MultiDataPoint } from "@statili/stats";
import { multilinearRegressionInsights } from "@statili/forge";
import { InsightPanel } from "../components/InsightPanel";
import { MultiStatsPanel } from "../components/MultiStatsPanel";
import { MULTI_DATASETS } from "../data/datasets";
import type { MultiDatasetKey } from "../data/datasets";

const MLR_KEYS: MultiDatasetKey[] = ["house_prices","student_scores","multi_error_insufficient"];

interface Args {
  dataset: MultiDatasetKey; precision: number;
  rSquaredThresholdWeak: number; rSquaredThresholdStrong: number; smallSampleThreshold: number;
}

function Demo({ dataset, precision, rSquaredThresholdWeak, rSquaredThresholdStrong, smallSampleThreshold }: Args) {
  const { data, description, featureNames } = MULTI_DATASETS[dataset];
  const stats = multilinear({ precision }, data as MultiDataPoint[]);
  const forge = multilinearRegressionInsights({ rSquaredThresholdWeak, rSquaredThresholdStrong, smallSampleThreshold }, stats);
  return (
    <div style={{ display:"flex", gap:24, alignItems:"flex-start", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ maxWidth:320 }}>
        <p style={{ margin:"0 0 10px", color:"#6b7280", fontSize:13 }}>{description}</p>
        <MultiStatsPanel result={stats} featureNames={featureNames} />
      </div>
      <InsightPanel result={forge} />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Forge / Multilinear Regression Insights",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:   { control:{ type:"select" }, options: MLR_KEYS, table:{ category:"Data" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    rSquaredThresholdWeak:   { control:{ type:"range", min:0,   max:0.6, step:0.05 }, table:{ category:"Forge Thresholds" } },
    rSquaredThresholdStrong: { control:{ type:"range", min:0.4, max:1,   step:0.05 }, table:{ category:"Forge Thresholds" } },
    smallSampleThreshold:    { control:{ type:"range", min:5,   max:100, step:5    }, table:{ category:"Forge Thresholds" } },
  },
  args: { precision:2, rSquaredThresholdWeak:0.3, rSquaredThresholdStrong:0.7, smallSampleThreshold:20 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const HousePricesInsights: Story  = { name:"Insight: House Prices (2 features)",  args:{ dataset:"house_prices"           } };
export const StudentScoreInsights: Story = { name:"Insight: Student Scores (3 features)", args:{ dataset:"student_scores"         } };
export const ErrorInsufficient: Story    = { name:"Error: Insufficient Observations",     args:{ dataset:"multi_error_insufficient"} };
