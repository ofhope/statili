import type { DataPoint } from "@statili/stats";

export type DatasetKey =
  | "strong_positive"
  | "perfect_positive"
  | "negative"
  | "flat"
  | "weak_scattered"
  | "with_outlier"
  | "nonlinear"
  | "error_vertical"
  | "error_insufficient";

export interface Dataset {
  label: string;
  description: string;
  data: DataPoint[];
}

/**
 * Named example datasets for Storybook stories.
 * All values are fixed (no Math.random) for deterministic story renders.
 */
export const DATASETS: Record<DatasetKey, Dataset> = {
  strong_positive: {
    label: "Strong Positive Trend",
    description: "20 points with a clear positive trend and light scatter (R² ≈ 0.99)",
    data: [
      [1, 4.1], [2, 4.8], [3, 8.2], [4, 9.1], [5, 10.4],
      [6, 11.9], [7, 16.2], [8, 15.8], [9, 20.1], [10, 19.7],
      [11, 23.8], [12, 24.1], [13, 27.6], [14, 28.9], [15, 32.1],
      [16, 31.8], [17, 35.4], [18, 37.9], [19, 39.1], [20, 42.4],
    ],
  },

  perfect_positive: {
    label: "Perfect Fit",
    description: "y = 2x + 1 — all points on the line, R² = 1, RMSE = 0",
    data: Array.from({ length: 10 }, (_, i) => [i + 1, 2 * (i + 1) + 1] as DataPoint),
  },

  negative: {
    label: "Negative Trend",
    description: "Negative slope with moderate scatter",
    data: [
      [1, 19.8], [2, 17.9], [3, 17.1], [4, 14.8], [5, 14.2],
      [6, 11.7], [7, 11.0], [8, 8.4], [9, 7.8], [10, 5.9],
      [11, 5.1], [12, 3.2], [13, 2.8], [14, 0.9], [15, 0.1],
    ],
  },

  flat: {
    label: "Flat / No Trend",
    description: "Slope ≈ 0 — Y is constant regardless of X",
    data: [
      [1, 5.1], [2, 4.9], [3, 5.2], [4, 4.8], [5, 5.0],
      [6, 5.3], [7, 4.7], [8, 5.1], [9, 5.0], [10, 4.9],
      [11, 5.2], [12, 4.8], [13, 5.1], [14, 4.9], [15, 5.0],
    ],
  },

  weak_scattered: {
    label: "Weak / Scattered",
    description: "Low R² — a linear model is a poor fit for this data",
    data: [
      [1, 8.0], [2, 2.1], [3, 9.3], [4, 4.4], [5, 12.1],
      [6, 1.2], [7, 15.3], [8, 3.1], [9, 7.4], [10, 11.2],
      [11, 5.0], [12, 14.1], [13, 2.3], [14, 9.2], [15, 6.4],
    ],
  },

  with_outlier: {
    label: "Outlier Present",
    description: "Strong trend with one clear outlier at x=7 (expected ≈ 14, actual = 28.5)",
    data: [
      [1, 2.1], [2, 4.3], [3, 5.9], [4, 8.1], [5, 10.2],
      [6, 11.8], [7, 28.5],
      [8, 16.1], [9, 17.9], [10, 20.3],
      [11, 22.1], [12, 24.2], [13, 25.8], [14, 28.1], [15, 30.2],
    ],
  },

  nonlinear: {
    label: "Non-linear (Quadratic)",
    description: "y ≈ 0.3x² — linear model breaks down on curved data",
    data: [
      [1, 0.3], [2, 1.4], [3, 2.6], [4, 4.9], [5, 7.3],
      [6, 10.7], [7, 14.8], [8, 19.1], [9, 24.6], [10, 30.3],
      [11, 36.7], [12, 43.1],
    ],
  },

  error_vertical: {
    label: "Error: Vertical Line",
    description: "All X values are identical — triggers DegenerateInput",
    data: [[5, 1], [5, 4], [5, 7], [5, 10], [5, 14]],
  },

  error_insufficient: {
    label: "Error: Insufficient Data",
    description: "Only 1 data point — triggers InsufficientData",
    data: [[3, 7]],
  },
};
