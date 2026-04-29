import type { RegressionResult, RegressionSuccess } from "@statili/stats";
import type {
  GeneratedInsight,
  InsightResultError,
  InsightResultSuccess,
  PowerInsightGenerationOptions,
} from "../types";
import { regressionError } from "./regressionError";

type PowerInsightsOutput = InsightResultSuccess | InsightResultError;

const DEFAULT_R2_WEAK       = 0.3;
const DEFAULT_R2_STRONG     = 0.7;
const DEFAULT_SMALL_SAMPLE  = 20;
const DEFAULT_NEAR_LINEAR   = 0.1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function doublingFactor(b: number): string {
  return (2 ** b).toFixed(2);
}

// ─── Insight: power law trend ─────────────────────────────────────────────────

function powerTrendDescription(
  result: RegressionSuccess,
  options: PowerInsightGenerationOptions,
): GeneratedInsight {
  const { slope: b, intercept: a, rmse, n, equation } = result;
  const nearLinearTolerance = options.nearLinearThreshold ?? DEFAULT_NEAR_LINEAR;
  const annotations: string[] = [`drawCurve:power`];

  let summary: string;

  if (Math.abs(b - 1) <= nearLinearTolerance) {
    // Exponent ≈ 1 — near-linear
    summary = `The data follows a near-linear power law (${equation}). ` +
      `With an exponent of ${b} (close to 1), Y is approximately proportional to X — ` +
      `doubling X roughly doubles Y.`;
  } else if (b > 1) {
    // Super-linear — accelerating growth
    summary = `The data follows an accelerating power law (${equation}). ` +
      `With an exponent of ${b} (> 1), Y grows faster than X. ` +
      `Doubling X multiplies Y by approximately ${doublingFactor(b)}. ` +
      `This pattern is common in economies of scale, network effects, and physical power laws.`;
    annotations.push(`powerGrowthRegime:superlinear`);
  } else if (b > 0) {
    // Sub-linear — diminishing returns
    summary = `The data follows a diminishing-returns power law (${equation}). ` +
      `With an exponent of ${b} (between 0 and 1), Y grows more slowly than X. ` +
      `Doubling X multiplies Y by only approximately ${doublingFactor(b)}, ` +
      `yielding progressively smaller gains.`;
    annotations.push(`powerGrowthRegime:sublinear`);
  } else if (b === 0) {
    summary = `The exponent is approximately 0, meaning Y is nearly constant regardless of X ` +
      `(the model predicts a flat line at y ≈ ${a}).`;
    annotations.push(`powerGrowthRegime:flat`);
  } else {
    // Negative exponent — inverse relationship
    summary = `The data follows an inverse power law (${equation}). ` +
      `With a negative exponent of ${b}, Y decreases as X increases. ` +
      `Doubling X reduces Y by a factor of ${doublingFactor(b)} (i.e. Y is multiplied by ${doublingFactor(b)}).`;
    annotations.push(`powerGrowthRegime:inverse`);
  }

  if (n < DEFAULT_SMALL_SAMPLE) {
    annotations.push(`smallSampleWarning:n=${n}`);
  }

  return {
    type: "PowerTrend",
    summary,
    data: { exponent: b, scale: a, doublingEffect: 2 ** b, equation, rmse, n },
    annotations,
  };
}

// ─── Insight: scale effect ────────────────────────────────────────────────────

function scaleInsight(result: RegressionSuccess): GeneratedInsight {
  const { slope: b, intercept: a } = result;

  return {
    type: "ScaleEffect",
    summary: `When x = 1, y = ${a} (the scale coefficient). ` +
      `Each 10× increase in X multiplies Y by approximately ${(10 ** b).toFixed(2)} ` +
      `(since y = ${a}·x^${b} → (10x)^${b} = 10^${b}·x^${b}).`,
    data: { scale: a, exponent: b, tenFoldEffect: 10 ** b },
  };
}

// ─── Insight: correlation strength ───────────────────────────────────────────

function correlationStrength(
  result: RegressionSuccess,
  options: PowerInsightGenerationOptions,
): GeneratedInsight {
  const { r2 } = result;
  const weak   = options.rSquaredThresholdWeak   ?? DEFAULT_R2_WEAK;
  const strong = options.rSquaredThresholdStrong ?? DEFAULT_R2_STRONG;

  let summary: string;
  if (r2 >= strong) {
    summary = `The power law model is a strong fit for this data (R² = ${r2.toFixed(2)}). ` +
      `The log-log relationship is highly consistent, accounting for most of the observed variance.`;
  } else if (r2 >= weak) {
    summary = `The power law model has a moderate fit (R² = ${r2.toFixed(2)}). ` +
      `A power law captures the general trend, but notable scatter remains around the curve.`;
  } else {
    summary = `The power law model is a poor fit for this data (R² = ${r2.toFixed(2)}). ` +
      `The data does not follow a consistent y = ax^b pattern — consider logarithmic, ` +
      `exponential, or polynomial models as alternatives.`;
  }

  return { type: "CorrelationStrength", summary, data: { r2 } };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * @function powerRegressionInsights
 * @description Generates human-readable insights from a power law regression result.
 *
 * Returned insights:
 * - **PowerTrend** — interprets the exponent (b) to describe growth regime
 *   (super-linear, sub-linear, inverse) with the doubling multiplier.
 * - **ScaleEffect** — explains what happens to Y under large multiplicative changes in X.
 * - **CorrelationStrength** — R²-based fit classification.
 *
 * @param options - Configuration thresholds.
 * @param statsResult - The raw result from `@statili/stats` `power()`.
 * @returns `InsightResultSuccess` or `InsightResultError`.
 */
export function powerRegressionInsights(
  options: PowerInsightGenerationOptions,
  statsResult: RegressionResult,
): PowerInsightsOutput {
  if (!statsResult.ok) {
    return regressionError(statsResult);
  }

  const insights: GeneratedInsight[] = [
    powerTrendDescription(statsResult, options),
    scaleInsight(statsResult),
    correlationStrength(statsResult, options),
  ];

  return { ok: true, insights };
}
