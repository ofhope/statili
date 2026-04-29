import type { MultiRegressionResult, MultiRegressionSuccess } from "@statili/stats";
import type {
  GeneratedInsight,
  InsightResultError,
  InsightResultSuccess,
  MultilinearInsightGenerationOptions,
} from "../types";

type MultilinearInsightsOutput = InsightResultSuccess | InsightResultError;

const DEFAULT_R2_WEAK      = 0.3;
const DEFAULT_R2_STRONG    = 0.7;
const DEFAULT_SMALL_SAMPLE = 20;

// ─── Error translation (mirrors regressionError for multi-input results) ──────

function multiRegressionError(err: Extract<MultiRegressionResult, { ok: false }>): InsightResultError {
  const base = { originalErrorType: err.errorType };
  switch (err.errorType) {
    case "InsufficientData":
      return { ok: false, ...base,
        message: "Unable to build a multilinear model: not enough observations.",
        helpText: "Provide at least (number of features + 1) valid data points. " +
          "For example, a model with 3 features needs at least 4 observations.",
      };
    case "NumericalStability":
      return { ok: false, ...base,
        message: "The model could not be fitted due to multicollinearity.",
        helpText: "Two or more features are highly correlated, making the normal equations singular. " +
          "Consider removing redundant features, standardising inputs, or using regularisation.",
      };
    case "InvalidInput":
      return { ok: false, ...base,
        message: "The input data contains invalid values.",
        helpText: "Ensure all feature values and y values are finite numbers. " +
          "Remove or replace any null, NaN, or non-numeric entries.",
      };
    default:
      return { ok: false, ...base,
        message: "An unexpected error occurred during multiple linear regression.",
        helpText: "Review your input data and check that feature dimensions are consistent across all observations.",
      };
  }
}

// ─── Insight: model summary ───────────────────────────────────────────────────

function modelSummary(result: MultiRegressionSuccess): GeneratedInsight {
  const { r2, rmse, n, numFeatures, equation } = result;
  const pctExplained = (r2 * 100).toFixed(1);

  return {
    type: "ModelSummary",
    summary: `The multiple linear regression model uses ${numFeatures} predictor${numFeatures > 1 ? "s" : ""} ` +
      `to explain ${pctExplained}% of the variance in Y (R² = ${r2.toFixed(2)}). ` +
      `Predictions deviate from actual values by ±${rmse} units on average (RMSE). ` +
      `The fitted equation is: ${equation}.`,
    data: { r2, rmse, n, numFeatures, equation },
    annotations: [`n=${n}`, `features=${numFeatures}`],
  };
}

// ─── Insight: feature contributions ──────────────────────────────────────────

function featureContributions(result: MultiRegressionSuccess): GeneratedInsight {
  const { coefficients } = result;
  const intercept = coefficients[0];
  const featureCoeffs = coefficients.slice(1);

  const lines: string[] = [
    `Intercept (b₀ = ${intercept}): the baseline predicted Y when all features equal zero.`,
  ];

  featureCoeffs.forEach((b, i) => {
    const direction = b > 0 ? "increases" : "decreases";
    const change    = Math.abs(b);
    lines.push(
      `Feature x${i + 1} (b${i + 1} = ${b}): holding all other features constant, ` +
      `a one-unit increase in x${i + 1} ${direction} Y by ${change} units.`,
    );
  });

  // Identify most influential feature by absolute coefficient magnitude
  const maxIdx = featureCoeffs
    .map(Math.abs)
    .reduce((best, val, i, arr) => val > arr[best] ? i : best, 0);

  const mostInfluential = featureCoeffs.length > 1
    ? ` The most influential predictor by coefficient magnitude is x${maxIdx + 1} (|b| = ${Math.abs(featureCoeffs[maxIdx])}).`
    : "";

  return {
    type: "FeatureContributions",
    summary: lines.join(" ") + mostInfluential,
    data: {
      intercept,
      coefficients: featureCoeffs,
      mostInfluentialFeatureIndex: maxIdx + 1,
    },
  };
}

// ─── Insight: correlation strength ───────────────────────────────────────────

function correlationStrength(
  result: MultiRegressionSuccess,
  options: MultilinearInsightGenerationOptions,
): GeneratedInsight {
  const { r2 } = result;
  const weak   = options.rSquaredThresholdWeak   ?? DEFAULT_R2_WEAK;
  const strong = options.rSquaredThresholdStrong ?? DEFAULT_R2_STRONG;

  let summary: string;
  if (r2 >= strong) {
    summary = `The model has a strong overall fit (R² = ${r2.toFixed(2)}). ` +
      `The selected features collectively account for the majority of variance in Y.`;
  } else if (r2 >= weak) {
    summary = `The model has a moderate overall fit (R² = ${r2.toFixed(2)}). ` +
      `The features explain a meaningful portion of the variance, but additional predictors ` +
      `or a different model form may improve accuracy.`;
  } else {
    summary = `The model has a weak overall fit (R² = ${r2.toFixed(2)}). ` +
      `The selected features explain little of the variance in Y. ` +
      `Consider adding more relevant predictors, engineering new features, or exploring non-linear models.`;
  }

  return { type: "CorrelationStrength", summary, data: { r2 } };
}

// ─── Insight: small sample warning ───────────────────────────────────────────

function smallSampleWarning(
  result: MultiRegressionSuccess,
  options: MultilinearInsightGenerationOptions,
): GeneratedInsight | null {
  const threshold = options.smallSampleThreshold ?? DEFAULT_SMALL_SAMPLE;
  const { n, numFeatures } = result;
  if (n >= threshold) return null;

  return {
    type: "SmallSampleWarning",
    summary: `The model was fitted on only ${n} observations (${numFeatures} feature${numFeatures > 1 ? "s" : ""} + intercept = ` +
      `${numFeatures + 1} parameters). With few degrees of freedom (${n - numFeatures - 1}), ` +
      `R² and coefficient estimates may not generalise reliably. Collect more data when possible.`,
    data: { n, numFeatures, degreesOfFreedom: n - numFeatures - 1 },
    annotations: [`smallSampleWarning:n=${n}`],
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * @function multilinearRegressionInsights
 * @description Generates human-readable insights from a multiple linear regression result.
 *
 * Returned insights:
 * - **ModelSummary** — overall fit (R², RMSE, equation) in plain language.
 * - **FeatureContributions** — per-coefficient direction, magnitude, and most-influential feature.
 * - **CorrelationStrength** — R²-based classification of fit quality.
 * - **SmallSampleWarning** — emitted when n is close to the number of parameters.
 *
 * @param options - Configuration thresholds.
 * @param statsResult - The raw result from `@statili/stats` `multilinear()`.
 * @returns `InsightResultSuccess` or `InsightResultError`.
 */
export function multilinearRegressionInsights(
  options: MultilinearInsightGenerationOptions,
  statsResult: MultiRegressionResult,
): MultilinearInsightsOutput {
  if (!statsResult.ok) {
    return multiRegressionError(statsResult);
  }

  const insights: GeneratedInsight[] = [];

  insights.push(modelSummary(statsResult));
  insights.push(featureContributions(statsResult));
  insights.push(correlationStrength(statsResult, options));

  const smallSample = smallSampleWarning(statsResult, options);
  if (smallSample) insights.push(smallSample);

  return { ok: true, insights };
}
