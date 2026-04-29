import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { logistic } from "@statili/stats";
import type { MultiDataPoint } from "@statili/stats";
import { logisticRegressionInsights } from "@statili/forge";
import { InsightPanel } from "../components/InsightPanel";
import { MultiStatsPanel } from "../components/MultiStatsPanel";
import { MULTI_DATASETS } from "../data/datasets";
import type { MultiDatasetKey } from "../data/datasets";

const LOG_KEYS: MultiDatasetKey[] = ["logistic_purchase","logistic_pass_fail","logistic_error_single_class"];

interface Args {
  dataset: MultiDatasetKey; learningRate: number; iterations: number; precision: number;
  accuracyWarningThreshold: number;
}

function Demo({ dataset, learningRate, iterations, precision, accuracyWarningThreshold }: Args) {
  const { data, description, featureNames } = MULTI_DATASETS[dataset];
  const stats = logistic({ learningRate, iterations, precision }, data as MultiDataPoint[]);
  const forge = logisticRegressionInsights({ accuracyWarningThreshold }, stats);
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
  title: "Forge / Logistic Regression Insights",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:      { control:{ type:"select" }, options: LOG_KEYS, table:{ category:"Data" } },
    learningRate: { control:{ type:"range", min:0.001, max:1, step:0.01 }, table:{ category:"Hyperparameters" } },
    iterations:   { control:{ type:"range", min:100, max:5000, step:100 }, table:{ category:"Hyperparameters" } },
    precision:    { control:{ type:"range", min:2, max:6, step:1 }, table:{ category:"Options" } },
    accuracyWarningThreshold: { control:{ type:"range", min:0.5, max:1, step:0.05 }, table:{ category:"Forge Thresholds" } },
  },
  args: { learningRate:0.1, iterations:1000, precision:4, accuracyWarningThreshold:0.7 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const PurchaseInsights: Story = { name:"Insight: Purchase Prediction",       args:{ dataset:"logistic_purchase"          } };
export const PassFailInsights: Story = { name:"Insight: Pass / Fail Classification",args:{ dataset:"logistic_pass_fail"         } };
export const ErrorSingleClass: Story = { name:"Error: Single Class (DegenerateInput)",args:{ dataset:"logistic_error_single_class"} };
