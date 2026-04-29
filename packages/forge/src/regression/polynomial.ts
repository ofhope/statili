import type { RegressionResult } from "@statili/stats";
import type {
  GeneratedInsight,
  InsightResultError,
  InsightResultSuccess,
  PolynomialInsightGenerationOptions,
} from "../types";
import { regressionError } from "./regressionError";

type PolynomialInsightsOutput = InsightResultSuccess | InsightResultError;

const DEFAULT_OVERFIT_RATIO = 0.33;
const DEFAULT_R2_WEAK = 0.3;
const DEFAULT_R2_STRONG = 0.7;
const DEFAULT_SMALL_SAMPLE = 20;

// ─── Insight: curve shape ────────────────────────────────────────────────────

function curveShape(result: Extract<ReturnType<(r: RegressionResult) => RegressionResult>, { ok: true }>): GeneratedInsight {
  const { degree = 2, coefficients = [], r2, rmse, n, equation } = result;
  const leadingCoeff = coefficients[degree] ?? 0;
  const annotations: string[] = [`drawCurve:polynomial`];

  let summary: string;

  if (degree === 1) {
    summary = `The polynomial fit is degree 1, equivalent to linear regression. ` +
      `The equation ${equation ?? ""} describes a straight-line relationship.`;
  } else if (degree === 2) {
    if (leadingCoeff > 0) {
      summary = `The data follows an upward-opening parabola (degree-2 polynomial). ` +
        `Y decreases to a minimum then accelerates upward as X grows. ` +
        `The vertex (minimum) is at x = ${formatVertex(coefficients)}.`;
    } else if (leadingCoeff < 0) {
      summary = `The data follows a downward-opening parabola (degree-2 polynomial). ` +
        `Y rises to a peak then diminishes — there is a maximum Y value at ` +
        `x = ${formatVertex(coefficients)}.`;
    } else {
      summary = `The quadratic term is near zero; the curve is essentially linear.`;
    }
    annotations.push(`drawVertex:${formatVertex(coefficients)}`);
  } else if (degree === 3) {
    summary = `The data follows a cubic polynomial (degree 3). The S-shaped curve has ` +
      `an inflection point where the direction of curvature changes — meaning the rate ` +
      `of change itself is not constant and the pattern is non-monotonic over parts of the range.`;
  } else {
    summary = `The data is modelled by a degree-${degree} polynomial. ` +
      `Higher-degree polynomials can capture complex non-linear patterns but are more ` +
      `susceptible to overfitting, especially with limited data.`;
  }

  if (n < DEFAULT_SMALL_SAMPLE) {
    annotations.push(`smallSampleWarning:n=${n}`);
  }

  return {
    type: "CurveShape",
    summary,
    data: { degree, leadingCoeff, equation, rmse, n },
    annotations,
  };
}

// ─── Vertex helper (quadratic only) ─────────────────────────────────────────

function formatVertex(coefficients: number[]): string {
  // Vertex of y = c₀ + c₁x + c₂x²  is at x = −c₁ / (2c₂)
  const c1 = coefficients[1] ?? 0;
  const c2 = coefficients[2] ?? 0;
  if (c2 === 0) return "undefined";
  return (-c1 / (2 * c2)).toFixed(2);
}

// ─── Insight: correlation strength (R²) ──────────────────────────────────────

function correlationStrength(
  result: Extract<ReturnType<(r: RegressionResult) => RegressionResult>, { ok: true }>,
  options: PolynomialInsightGenerationOptions,
): GeneratedInsight {
  const { r2 } = result;
  const weak   = options.rSquaredThresholdWeak   ?? DEFAULT_R2_WEAK;
  const strong = options.rSquaredThresholdStrong ?? DEFAULT_R2_STRONG;

  let summary: string;
  if (r2 >= strong) {
    summary = `The polynomial model explains a large proportion of the variance in Y ` +
      `(R² = ${r2.toFixed(2)}), indicating a strong fit to the data.`;
  } else if (r2 >= weak) {
    summary = `The polynomial model has a moderate fit (R² = ${r2.toFixed(2)}). ` +
      `A meaningful portion of the variance is explained, but some scatter remains.`;
  } else {
    summary = `The polynomial model has a weak fit (R² = ${r2.toFixed(2)}). ` +
      `Even after accounting for curvature, the model explains little of the variance. ` +
      `Consider whether a different model family or additional features might be more appropriate.`;
  }

  return { type: "CorrelationStrength", summary, data: { r2 } };
}

// ─── Insight: overfit warning ────────────────────────────────────────────────

function overfitWarning(
  result: Extract<ReturnType<(r: RegressionResult) => RegressionResult>, { ok: true }>,
  options: PolynomialInsightGenerationOptions,
): GeneratedInsight | null {
  const { degree = 2, n } = result;
  const threshold = options.overfitRatioThreshold ?? DEFAULT_OVERFIT_RATIO;
  if (degree <= n * threshold) return null;

  return {
    type: "OverfitWarning",
    summary: `⚠ The polynomial degree (${degree}) is high relative to the number of ` +
      `observations (n = ${n}). With ${n - degree - 1} degrees of freedom remaining, ` +
      `the model may be fitting noise rather than the underlying signal. ` +
      `Collect more data or reduce the polynomial degree to improve generalisability.`,
    data: { degree, n, degreesOfFreedom: n - degree - 1 },
    annotations: ["overfitRisk:high"],
  };
}

// ─── Insight: goodness of fit (RMSE) ─────────────────────────────────────────

function goodnessOfFit(
  result: Extract<ReturnType<(r: RegressionResult) => RegressionResult>, { ok: true }>,
): GeneratedInsight {
  const { rmse } = result;
  return {
    type: "GoodnessOfFit",
    summary: `The model's average prediction error is ±${rmse} units (RMSE). ` +
      `Predictions made from this polynomial curve are expected to deviate from ` +
      `actual Y values by approximately this amount on average.`,
    data: { rmse },
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * @function polynomialRegressionInsights
 * @description Generates human-readable insights from a polynomial regression result.
 *
 * Returned insights:
 * - **CurveShape** — describes the degree and orientation of the polynomial curve.
 * - **CorrelationStrength** — R²-based fit classification.
 * - **OverfitWarning** — emitted when degree is high relative to n (risk of fitting noise).
 * - **GoodnessOfFit** — RMSE-based prediction accuracy statement.
 *
 * @param options - Thresholds and configuration for insight classification.
 * @param statsResult - The raw result from `@statili/stats` `polynomial()`.
 * @returns `InsightResultSuccess` with an array of insights, or `InsightResultError`
 *   with a user-friendly explanation if the regression failed.
 */
export function polynomialRegressionInsights(
  options: PolynomialInsightGenerationOptions,
  statsResult: RegressionResult,
): PolynomialInsightsOutput {
  if (!statsResult.ok) {
    return regressionError(statsResult);
  }

  const insights: GeneratedInsight[] = [];

  insights.push(curveShape(statsResult as any));
  insights.push(correlationStrength(statsResult as any, options));

  const overfit = overfitWarning(statsResult as any, options);
  if (overfit) insights.push(overfit);

  insights.push(goodnessOfFit(statsResult as any));

  return { ok: true, insights };
}
