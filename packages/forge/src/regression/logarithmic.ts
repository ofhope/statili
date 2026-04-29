import type { RegressionResult, RegressionSuccess } from "@statili/stats";
import type {
  GeneratedInsight,
  InsightResultError,
  InsightResultSuccess,
  LogarithmicInsightGenerationOptions,
} from "../types";
import { regressionError } from "./regressionError";

type LogarithmicInsightsOutput = InsightResultSuccess | InsightResultError;

const DEFAULT_R2_WEAK      = 0.3;
const DEFAULT_R2_STRONG    = 0.7;
const DEFAULT_SMALL_SAMPLE = 20;

// ─── Insight: logarithmic trend ───────────────────────────────────────────────

function logarithmicTrend(result: RegressionSuccess): GeneratedInsight {
  const { slope: b, intercept: a, n, equation } = result;
  const annotations: string[] = [`drawCurve:logarithmic`];

  let summary: string;

  if (b > 0) {
    summary = `The data follows a logarithmic growth curve (${equation}). ` +
      `Y increases rapidly for small values of X, then progressively levels off as X grows. ` +
      `Each time X is multiplied by 10, Y increases by approximately ${(b * Math.log(10)).toFixed(2)} units. ` +
      `This is the classic diminishing-returns pattern — later gains cost proportionally more.`;
    annotations.push(`diminishingReturns:true`);
  } else if (b < 0) {
    summary = `The data follows a logarithmic decay curve (${equation}). ` +
      `Y decreases rapidly for small X values, then levels off and stabilises as X grows. ` +
      `Each 10× increase in X reduces Y by approximately ${Math.abs(b * Math.log(10)).toFixed(2)} units.`;
    annotations.push(`diminishingReturns:inverse`);
  } else {
    summary = `The logarithmic coefficient is zero — Y is approximately constant ` +
      `regardless of X (flat relationship at y ≈ ${a}).`;
  }

  if (n < DEFAULT_SMALL_SAMPLE) {
    annotations.push(`smallSampleWarning:n=${n}`);
  }

  return {
    type: "LogarithmicTrend",
    summary,
    data: {
      logCoefficient: b,
      constant: a,
      gainPer10x: b * Math.log(10),
      equation,
      n,
    },
    annotations,
  };
}

// ─── Insight: diminishing returns ─────────────────────────────────────────────

function diminishingReturns(result: RegressionSuccess): GeneratedInsight | null {
  const { slope: b } = result;
  if (b <= 0) return null;

  // At what x does Y gain only half its initial rate?
  // derivative dy/dx = b/x  → rate halves when x doubles
  return {
    type: "DiminishingReturns",
    summary: `Each doubling of X yields only ${b.toFixed(2)}·ln(2) ≈ ${(b * Math.LN2).toFixed(2)} additional units of Y. ` +
      `This means the payoff of further increases in X shrinks steadily — ` +
      `the first doubling has the same absolute gain as the second, third, and all subsequent doublings. ` +
      `Useful for modelling learning curves, natural resource extraction, or platform growth.`,
    data: { gainPerDoubling: b * Math.LN2, logCoefficient: b },
  };
}

// ─── Insight: correlation strength ───────────────────────────────────────────

function correlationStrength(
  result: RegressionSuccess,
  options: LogarithmicInsightGenerationOptions,
): GeneratedInsight {
  const { r2 } = result;
  const weak   = options.rSquaredThresholdWeak   ?? DEFAULT_R2_WEAK;
  const strong = options.rSquaredThresholdStrong ?? DEFAULT_R2_STRONG;

  let summary: string;
  if (r2 >= strong) {
    summary = `The logarithmic model is a strong fit (R² = ${r2.toFixed(2)}), ` +
      `capturing the non-linear growth pattern well.`;
  } else if (r2 >= weak) {
    summary = `The logarithmic model has a moderate fit (R² = ${r2.toFixed(2)}). ` +
      `The diminishing-returns shape is present but with notable scatter.`;
  } else {
    summary = `The logarithmic model is a poor fit (R² = ${r2.toFixed(2)}). ` +
      `The data does not clearly follow a y = a + b·ln(x) pattern — ` +
      `consider power law, polynomial, or linear regression as alternatives.`;
  }

  return { type: "CorrelationStrength", summary, data: { r2 } };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * @function logarithmicRegressionInsights
 * @description Generates human-readable insights from a logarithmic regression result.
 *
 * Returned insights:
 * - **LogarithmicTrend** — interprets the direction and rate of the log curve,
 *   including how much Y changes per 10× increase in X.
 * - **DiminishingReturns** — emitted when b > 0; explains the gain-per-doubling of X.
 * - **CorrelationStrength** — R²-based fit classification.
 *
 * @param options - Configuration thresholds.
 * @param statsResult - The raw result from `@statili/stats` `logarithmic()`.
 * @returns `InsightResultSuccess` or `InsightResultError`.
 */
export function logarithmicRegressionInsights(
  options: LogarithmicInsightGenerationOptions,
  statsResult: RegressionResult,
): LogarithmicInsightsOutput {
  if (!statsResult.ok) {
    return regressionError(statsResult);
  }

  const insights: GeneratedInsight[] = [];

  insights.push(logarithmicTrend(statsResult));

  const dr = diminishingReturns(statsResult);
  if (dr) insights.push(dr);

  insights.push(correlationStrength(statsResult, options));

  return { ok: true, insights };
}
