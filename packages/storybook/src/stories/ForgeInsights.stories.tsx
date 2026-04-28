import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { linear } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { linearRegressionInsights } from "@statili/forge";
import { ScatterPlot } from "../components/ScatterPlot";
import { InsightPanel } from "../components/InsightPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

// ─── Story wrapper ────────────────────────────────────────────────────────────

interface Args {
  dataset: DatasetKey;
  precision: number;
  rSquaredThresholdWeak: number;
  rSquaredThresholdStrong: number;
  smallSampleThreshold: number;
  chartWidth: number;
  chartHeight: number;
}

function ForgeInsightsDemo({
  dataset,
  precision,
  rSquaredThresholdWeak,
  rSquaredThresholdStrong,
  smallSampleThreshold,
  chartWidth,
  chartHeight,
}: Args) {
  const { data, description } = DATASETS[dataset];

  const statsResult = linear({ precision }, data as DataPoint[]);
  const forgeResult = linearRegressionInsights(
    { rSquaredThresholdWeak, rSquaredThresholdStrong, smallSampleThreshold },
    statsResult,
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 10px",
            color: "#6b7280",
            fontSize: 13,
            maxWidth: chartWidth,
          }}
        >
          {description}
        </p>
        <ScatterPlot
          data={data as DataPoint[]}
          result={statsResult}
          width={chartWidth}
          height={chartHeight}
        />
      </div>
      <InsightPanel result={forgeResult} />
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ForgeInsightsDemo> = {
  title: "Forge / Linear Regression Insights",
  component: ForgeInsightsDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**\`@statili/forge\`** is the interpretation layer above \`@statili/stats\`.

\`linearRegressionInsights(options, statsResult)\` takes the raw regression output
and returns an array of \`GeneratedInsight\` objects — each with:

| Field | Description |
|---|---|
| \`type\` | Programmatic identifier for the insight (e.g. \`TrendDescription\`) |
| \`summary\` | Human-readable sentence suitable for display to end-users |
| \`data\` | Structured data payload for downstream use (e.g. chart renderers) |
| \`annotations\` | Instruction strings for chart annotation libraries |

When the stats computation fails (e.g. insufficient data), Forge translates the
technical \`errorType\` into a user-facing **message** and an actionable **helpText**.

Use the **Controls** panel to adjust R² thresholds and see how the insight
summaries change in real time.
        `.trim(),
      },
    },
  },
  argTypes: {
    dataset: {
      control: { type: "select" },
      options: Object.keys(DATASETS) as DatasetKey[],
      description: "Pre-built dataset scenario",
      table: { category: "Data" },
    },
    precision: {
      control: { type: "range", min: 0, max: 6, step: 1 },
      description: "Decimal places for rounding coefficients",
      table: { category: "Options" },
    },
    rSquaredThresholdWeak: {
      control: { type: "range", min: 0, max: 0.6, step: 0.05 },
      description: "R² below this → 'weak correlation' message",
      table: { category: "Forge Thresholds" },
    },
    rSquaredThresholdStrong: {
      control: { type: "range", min: 0.4, max: 1, step: 0.05 },
      description: "R² at or above this → 'strong correlation' message",
      table: { category: "Forge Thresholds" },
    },
    smallSampleThreshold: {
      control: { type: "range", min: 5, max: 100, step: 5 },
      description: "n below this → small-sample annotation added",
      table: { category: "Forge Thresholds" },
    },
    chartWidth: {
      control: { type: "range", min: 300, max: 800, step: 20 },
      table: { category: "Display" },
    },
    chartHeight: {
      control: { type: "range", min: 200, max: 600, step: 20 },
      table: { category: "Display" },
    },
  },
  args: {
    precision: 2,
    rSquaredThresholdWeak: 0.3,
    rSquaredThresholdStrong: 0.7,
    smallSampleThreshold: 20,
    chartWidth: 540,
    chartHeight: 360,
  },
};

export default meta;
type Story = StoryObj<typeof ForgeInsightsDemo>;

// ─── Insight stories ──────────────────────────────────────────────────────────

/**
 * A strong positive trend produces two insight cards:
 * - **TrendDescription** — describes the direction and magnitude of the slope.
 * - **CorrelationStrength** — reports the R² and classifies fit quality.
 *
 * Adjust the R² thresholds in Controls to see the CorrelationStrength summary change.
 */
export const StrongPositiveTrend: Story = {
  name: "Insight: Strong Positive Trend",
  args: { dataset: "strong_positive" },
};

/**
 * A negative slope — Forge describes the inverse relationship between X and Y.
 */
export const NegativeTrend: Story = {
  name: "Insight: Negative Trend",
  args: { dataset: "negative" },
};

/**
 * Slope ≈ 0 — Forge reports no meaningful linear trend.
 * The CorrelationStrength card reflects the weak R².
 */
export const FlatNoTrend: Story = {
  name: "Insight: Flat / No Trend",
  args: { dataset: "flat" },
};

/**
 * Highly scattered data with a low R². Forge classifies correlation as **weak**
 * and appends a note that the linear model may not be the best fit.
 *
 * Try lowering `rSquaredThresholdWeak` in Controls to reclassify it as moderate.
 */
export const WeakFit: Story = {
  name: "Insight: Weak Fit",
  args: { dataset: "weak_scattered" },
};

/**
 * Only 5 data points — below the default `smallSampleThreshold` of 20.
 * Forge adds a `smallSampleWarning` annotation to the TrendDescription card.
 *
 * Raise `smallSampleThreshold` to 100 in Controls to see the warning applied
 * to the larger datasets too.
 */
export const SmallSampleWarning: Story = {
  name: "Insight: Small Sample Warning",
  args: { dataset: "error_vertical", precision: 2 },
  parameters: {
    docs: {
      description: {
        story:
          "This uses the vertical-line dataset (5 points) to trigger a stats error. " +
          "Forge translates it into the DegenerateInput error card below. " +
          "Switch to `flat` or `with_outlier` with a high `smallSampleThreshold` " +
          "to see the warning on a successful result.",
      },
    },
  },
};

// ─── Error translation stories ────────────────────────────────────────────────

/**
 * `DegenerateInput` — all X values are identical (vertical line).
 *
 * Forge translates this into a user-facing message explaining that X must vary,
 * rather than exposing the raw technical error.
 */
export const ErrorDegenerateInput: Story = {
  name: "Error: Vertical Line (DegenerateInput)",
  args: { dataset: "error_vertical" },
};

/**
 * `InsufficientData` — only one data point was provided.
 *
 * Forge explains the minimum data requirement in plain language.
 */
export const ErrorInsufficientData: Story = {
  name: "Error: Insufficient Data",
  args: { dataset: "error_insufficient" },
};
