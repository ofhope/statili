import { curry } from "@statili/fp";
import type { RegressionSuccess } from "@statili/stats";
import type { GeneratedInsight, LinearInsightGenerationOptions } from "../types";

/**
 * @function correlationStrength
 * @description Generates an insight classifying the strength of the linear correlation based on R².
 *
 * Uses configurable thresholds to bucket R² into strong / moderate / weak, then produces
 * a human-readable summary and retains the raw `r2` value in the `data` payload for
 * programmatic use (e.g. conditional chart styling).
 *
 * @param {LinearInsightGenerationOptions} options - Thresholds and configuration.
 * @param {RegressionSuccess} result - The successful result from @statili/stats linear regression.
 * @returns {GeneratedInsight} An insight about correlation strength.
 *
 * @example
 * // Curried usage (data-last):
 * const classify = correlationStrength({ rSquaredThresholdWeak: 0.3, rSquaredThresholdStrong: 0.7 });
 * const insight = classify(regressionResult);
 */
export const correlationStrength = curry((
  options: LinearInsightGenerationOptions,
  result: RegressionSuccess
): GeneratedInsight => {
  const { r2 } = result;
  const rSqWeak = options.rSquaredThresholdWeak ?? 0.3;
  const rSqStrong = options.rSquaredThresholdStrong ?? 0.7;

  let summary: string;

  if (r2 >= rSqStrong) {
    summary = `There is a strong linear correlation (R²: ${r2.toFixed(2)}), indicating the model explains a large portion of the variance.`;
  } else if (r2 >= rSqWeak) {
    summary = `There is a moderate linear correlation (R²: ${r2.toFixed(2)}).`;
  } else {
    summary = `There is a weak linear correlation (R²: ${r2.toFixed(2)}), suggesting the linear model may not be the best fit or other factors are at play.`;
  }

  return {
    summary,
    type: "CorrelationStrength",
    data: { r2 },
  };
});
