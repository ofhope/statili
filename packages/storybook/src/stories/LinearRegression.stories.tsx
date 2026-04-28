import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { linear } from "@statili/stats";
import type { DataPoint } from "@statili/stats";
import { ScatterPlot } from "../components/ScatterPlot";
import { StatsPanel } from "../components/StatsPanel";
import { DATASETS } from "../data/datasets";
import type { DatasetKey } from "../data/datasets";

// ─── Story wrapper ────────────────────────────────────────────────────────────

interface Args {
  dataset: DatasetKey;
  precision: number;
  chartWidth: number;
  chartHeight: number;
}

function LinearRegressionDemo({ dataset, precision, chartWidth, chartHeight }: Args) {
  const { data, description } = DATASETS[dataset];
  const result = linear({ precision }, data as DataPoint[]);

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
          result={result}
          width={chartWidth}
          height={chartHeight}
        />
      </div>
      <StatsPanel result={result} />
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof LinearRegressionDemo> = {
  title: "Stats / Linear Regression",
  component: LinearRegressionDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Simple linear regression via \`@statili/stats\`.

The algorithm fits the line **y = slope·x + intercept** by minimising the sum of squared
residuals (OLS). The **Stats Result** panel shows the key metrics returned by \`linear()\`:

| Field | Description |
|---|---|
| \`slope\` | Rate of change: Y increases by this amount per unit X |
| \`intercept\` | Expected Y when X = 0 |
| \`r2\` | Coefficient of determination — proportion of Y variance explained (0–1) |
| \`rmse\` | Root Mean Squared Error — typical prediction error in Y-axis units |
| \`n\` | Number of data points used |

Use the **Controls** panel to switch datasets and adjust precision.
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
      description: "Decimal places for rounding output coefficients",
      table: { category: "Options" },
    },
    chartWidth: {
      control: { type: "range", min: 300, max: 800, step: 20 },
      description: "Chart width in pixels",
      table: { category: "Display" },
    },
    chartHeight: {
      control: { type: "range", min: 200, max: 600, step: 20 },
      description: "Chart height in pixels",
      table: { category: "Display" },
    },
  },
  args: {
    precision: 2,
    chartWidth: 540,
    chartHeight: 360,
  },
};

export default meta;
type Story = StoryObj<typeof LinearRegressionDemo>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * A strong positive trend with light scatter — the canonical use case for
 * linear regression. R² is high and the line fits visually well.
 */
export const StrongPositiveTrend: Story = {
  name: "Strong Positive Trend",
  args: { dataset: "strong_positive" },
};

/**
 * All points lie exactly on y = 2x + 1.
 * R² = 1 and RMSE = 0 — a reference case for a perfect linear relationship.
 */
export const PerfectFit: Story = {
  name: "Perfect Fit (R² = 1, RMSE = 0)",
  args: { dataset: "perfect_positive" },
};

/**
 * Slope is negative — Y decreases as X increases.
 * The Stats Result panel shows a negative slope value.
 */
export const NegativeTrend: Story = {
  name: "Negative Trend",
  args: { dataset: "negative" },
};

/**
 * Slope ≈ 0. There is no meaningful linear relationship between X and Y.
 * The regression line is nearly horizontal regardless of X.
 */
export const FlatNoTrend: Story = {
  name: "Flat / No Trend",
  args: { dataset: "flat" },
};

/**
 * High scatter — the linear model explains very little variance (low R²).
 * The line is technically valid but a poor description of the data.
 * This is the scenario where Forge emits a "weak correlation" warning.
 */
export const WeakFit: Story = {
  name: "Weak Fit (Low R²)",
  args: { dataset: "weak_scattered" },
};

/**
 * A mostly linear dataset with one clear outlier at x = 7.
 * Notice how the regression line is pulled towards the outlier, inflating RMSE
 * and slightly degrading R². This illustrates sensitivity to extreme values.
 */
export const OutlierPresent: Story = {
  name: "Outlier Present",
  args: { dataset: "with_outlier" },
};

/**
 * Data generated from y ≈ 0.3x², which is inherently non-linear.
 * The linear model produces a low-to-moderate R² — use this story to illustrate
 * why checking residual patterns matters before trusting a linear fit.
 */
export const NonLinearData: Story = {
  name: "Non-linear Data (Quadratic)",
  args: { dataset: "nonlinear" },
};

/**
 * All X values are identical — linear regression is mathematically undefined
 * (a vertical line has infinite slope). The function returns a
 * `DegenerateInput` error; no regression line is drawn.
 */
export const ErrorVerticalLine: Story = {
  name: "Error: Vertical Line (DegenerateInput)",
  args: { dataset: "error_vertical" },
};

/**
 * Only one data point is provided. A minimum of two distinct points is required
 * to fit a line. Returns an `InsufficientData` error.
 */
export const ErrorInsufficientData: Story = {
  name: "Error: Insufficient Data",
  args: { dataset: "error_insufficient" },
};
