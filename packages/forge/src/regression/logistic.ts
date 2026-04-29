import type { MultiRegressionResult, MultiRegressionSuccess } from "@statili/stats";
import type {
  GeneratedInsight,
  InsightResultError,
  InsightResultSuccess,
  LogisticInsightGenerationOptions,
} from "../types";

type LogisticInsightsOutput = InsightResultSuccess | InsightResultError;

const DEFAULT_ACCURACY_WARNING  = 0.7;
const DEFAULT_PSEUDO_R2_WEAK    = 0.2;
const DEFAULT_PSEUDO_R2_STRONG  = 0.4;
const DEFAULT_SMALL_SAMPLE      = 20;

// ─── Error translation ────────────────────────────────────────────────────────

function logisticRegressionError(err: Extract<MultiRegressionResult, { ok: false }>): InsightResultError {
  const base = { originalErrorType: err.errorType };
  switch (err.errorType) {
    case "InsufficientData":
      return { ok: false, ...base,
        message: "Unable to fit the logistic model: not enough observations.",
        helpText: "Provide at least 2 observations, and ensure both classes (y=0 and y=1) are represented.",
      };
    case "DegenerateInput":
      return { ok: false, ...base,
        message: "Unable to fit the logistic model: only one class is present.",
        helpText: "Logistic regression requires observations from both classes (y=0 and y=1). " +
          "If all outcomes are the same, classification is trivial and a model is not needed.",
      };
    case "InvalidInput":
      return { ok: false, ...base,
        message: "Invalid data provided: y values must be binary (0 or 1).",
        helpText: "Ensure every y value is exactly 0 or 1. If your outcome is continuous, " +
          "consider linear regression instead.",
      };
    default:
      return { ok: false, ...base,
        message: "An unexpected error occurred during logistic regression.",
        helpText: "Review your data for inconsistent feature dimensions or non-numeric values.",
      };
  }
}

// ─── Insight: classification summary ─────────────────────────────────────────

function classificationSummary(
  result: MultiRegressionSuccess,
  options: LogisticInsightGenerationOptions,
): GeneratedInsight {
  const { accuracy = NaN, n, numFeatures } = result;
  const threshold = options.accuracyWarningThreshold ?? DEFAULT_ACCURACY_WARNING;
  const pct = isNaN(accuracy) ? "N/A" : `${(accuracy * 100).toFixed(1)}%`;
  const annotations: string[] = [];

  let summary = `The logistic regression model uses ${numFeatures} feature${numFeatures > 1 ? "s" : ""} ` +
    `to classify observations as positive (y=1) or negative (y=0). ` +
    `On ${n} training observations, it achieves ${pct} classification accuracy ` +
    `(predictions with estimated probability ≥ 0.5 are classified as positive).`;

  if (!isNaN(accuracy) && accuracy < threshold) {
    summary += ` ⚠ This accuracy is below the ${(threshold * 100).toFixed(0)}% threshold — ` +
      `the model may not be distinguishing the two classes effectively. ` +
      `Consider gathering more data, adding predictive features, or tuning the learning rate and iteration count.`;
    annotations.push(`lowAccuracyWarning:${(accuracy * 100).toFixed(1)}%`);
  }

  if (n < DEFAULT_SMALL_SAMPLE) {
    annotations.push(`smallSampleWarning:n=${n}`);
  }

  return {
    type: "ClassificationSummary",
    summary,
    data: { accuracy, n, numFeatures },
    annotations,
  };
}

// ─── Insight: model fit (pseudo-R²) ──────────────────────────────────────────

function modelFit(
  result: MultiRegressionSuccess,
  options: LogisticInsightGenerationOptions,
): GeneratedInsight {
  const { r2 } = result; // McFadden pseudo-R²
  const weak   = options.pseudoR2ThresholdWeak   ?? DEFAULT_PSEUDO_R2_WEAK;
  const strong = options.pseudoR2ThresholdStrong ?? DEFAULT_PSEUDO_R2_STRONG;

  let fitLabel: string;
  if (isNaN(r2)) {
    fitLabel = "could not be computed";
  } else if (r2 >= strong) {
    fitLabel = "excellent (McFadden pseudo-R² ≥ 0.4)";
  } else if (r2 >= weak) {
    fitLabel = "acceptable (McFadden pseudo-R² ≥ 0.2)";
  } else {
    fitLabel = "weak (McFadden pseudo-R² < 0.2)";
  }

  const r2Str = isNaN(r2) ? "N/A" : r2.toFixed(4);

  return {
    type: "ModelFit",
    summary: `Model fit is ${fitLabel} (McFadden pseudo-R² = ${r2Str}). ` +
      `Note: pseudo-R² values are not directly comparable to ordinary R² — ` +
      `values above 0.2 are generally considered good, and above 0.4 are excellent ` +
      `for logistic regression.`,
    data: { pseudoR2: r2 },
  };
}

// ─── Insight: feature contributions ──────────────────────────────────────────

function featureContributions(result: MultiRegressionSuccess): GeneratedInsight {
  const { coefficients } = result;
  const intercept = coefficients[0];
  const featureCoeffs = coefficients.slice(1);

  const lines: string[] = [
    `Intercept (b₀ = ${intercept}): log-odds of y=1 when all features are zero.`,
  ];

  featureCoeffs.forEach((b, i) => {
    const oddsMultiplier = Math.exp(b).toFixed(3);
    const direction      = b > 0 ? "increases" : "decreases";
    lines.push(
      `x${i + 1} (b${i + 1} = ${b}): a one-unit increase ${direction} the log-odds of y=1 by ${Math.abs(b)}, ` +
      `corresponding to an odds multiplier of ${oddsMultiplier}.`,
    );
  });

  const maxIdx = featureCoeffs
    .map(Math.abs)
    .reduce((best, val, i, arr) => val > arr[best] ? i : best, 0);

  const mostInfluential = featureCoeffs.length > 1
    ? ` The strongest predictor (by log-odds magnitude) is x${maxIdx + 1} (|b| = ${Math.abs(featureCoeffs[maxIdx])}).`
    : "";

  return {
    type: "FeatureContributions",
    summary: lines.join(" ") + mostInfluential,
    data: {
      intercept,
      coefficients: featureCoeffs,
      oddsRatios: featureCoeffs.map(b => Math.exp(b)),
      mostInfluentialFeatureIndex: maxIdx + 1,
    },
  };
}

// ─── Insight: decision boundary ───────────────────────────────────────────────

function decisionBoundary(result: MultiRegressionSuccess): GeneratedInsight {
  const { coefficients, numFeatures, equation } = result;
  const intercept = coefficients[0];

  let boundaryDesc: string;
  if (numFeatures === 1) {
    const b1 = coefficients[1];
    if (b1 !== 0) {
      const xBoundary = (-intercept / b1).toFixed(3);
      boundaryDesc = `For single-feature inputs, the decision boundary is at x₁ = ${xBoundary} ` +
        `(where the linear predictor equals 0 and P(y=1) = 0.5).`;
    } else {
      boundaryDesc = "The slope coefficient is zero — the model cannot separate the classes using this feature.";
    }
  } else {
    boundaryDesc = `The decision boundary is the hyperplane in ${numFeatures}-dimensional ` +
      `feature space where the linear predictor equals 0 (i.e. P(y=1) = 0.5). ` +
      `The model predicts y=1 when ${equation.replace("P(y=1) = σ(", "").replace(")", "")} > 0.`;
  }

  return {
    type: "DecisionBoundary",
    summary: `The model classifies observations as positive when the estimated probability ` +
      `exceeds 0.5. ${boundaryDesc}`,
    data: { coefficients, equation },
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * @function logisticRegressionInsights
 * @description Generates human-readable insights from a logistic regression result.
 *
 * Returned insights:
 * - **ClassificationSummary** — accuracy and sample size; warns if accuracy is low.
 * - **ModelFit** — McFadden pseudo-R² with contextualised interpretation.
 * - **FeatureContributions** — per-coefficient direction, log-odds magnitude, and odds ratios.
 * - **DecisionBoundary** — describes where P(y=1) = 0.5 in feature space.
 *
 * @param options - Configuration thresholds.
 * @param statsResult - The raw result from `@statili/stats` `logistic()`.
 * @returns `InsightResultSuccess` or `InsightResultError`.
 */
export function logisticRegressionInsights(
  options: LogisticInsightGenerationOptions,
  statsResult: MultiRegressionResult,
): LogisticInsightsOutput {
  if (!statsResult.ok) {
    return logisticRegressionError(statsResult);
  }

  const insights: GeneratedInsight[] = [
    classificationSummary(statsResult, options),
    modelFit(statsResult, options),
    featureContributions(statsResult),
    decisionBoundary(statsResult),
  ];

  return { ok: true, insights };
}
