import type { RegressionSuccess } from "@statili/stats";
import type { GeneratedInsight, LinearInsightGenerationOptions } from "../types";

const DEFAULT_SMALL_SAMPLE_THRESHOLD = 20;

/**
 * @function regressionSummary
 * @description Generates a natural language summary of the linear regression trend.
 *
 * Describes the direction of the relationship (positive / negative / flat) and enriches
 * the insight `data` payload with the key coefficients, fit metrics, and sample size so
 * that downstream consumers (e.g. chart renderers) have everything they need without
 * re-accessing the raw stats result.
 *
 * @param {RegressionSuccess} result - The successful result from @statili/stats linear regression.
 * @param {LinearInsightGenerationOptions} [options] - Optional configuration (e.g. smallSampleThreshold).
 * @returns {GeneratedInsight} A descriptive insight about the linear trend.
 */
export const regressionSummary = (
  result: RegressionSuccess,
  options: LinearInsightGenerationOptions = {}
): GeneratedInsight => {
  const { slope, intercept, rmse, n } = result;
  const smallSampleThreshold = options.smallSampleThreshold ?? DEFAULT_SMALL_SAMPLE_THRESHOLD;

  let summary: string;

  if (slope > 0) {
    summary = `There is a positive linear trend. As X increases, Y tends to increase.`;
  } else if (slope < 0) {
    summary = `There is a negative linear trend. As X increases, Y tends to decrease.`;
  } else {
    summary = `There is no significant linear trend. Y remains relatively constant as X changes.`;
  }

  const annotations: string[] = [`drawTrendLine:${slope},${intercept}`];

  if (n < smallSampleThreshold) {
    annotations.push(`smallSampleWarning:n=${n}`);
  }

  return {
    summary,
    type: "TrendDescription",
    data: { slope, intercept, rmse, n },
    annotations,
  };
};
