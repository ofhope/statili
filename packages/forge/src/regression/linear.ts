import type { RegressionResult } from "@statili/stats";
import type { GeneratedInsight, InsightResultError, InsightResultSuccess, LinearInsightGenerationOptions } from "../types";
import { regressionError } from "./regressionError";
import { regressionSummary } from "./summary";
import { correlationStrength } from "./correlation";

export type LinearInsightsOutput = InsightResultSuccess | InsightResultError;

/**
 * @function linearRegressionInsights
 * @description Orchestrates the generation of various insights from a linear regression result.
 * This function acts as the primary entry point for linear regression insight generation in @statili/forge.
 * @param {LinearInsightGenerationOptions} options - Configuration options for the insights.
 * @param {LinearRegressionResult} statsResult - The raw result from @statili/stats.linear.
 * @returns {LinearInsightsOutput} A discriminant union containing either an array of insights or a user-friendly error.
 */
export function linearRegressionInsights(
    options: LinearInsightGenerationOptions,
    statsResult: RegressionResult
): LinearInsightsOutput {
    if (!statsResult.ok) {
        return regressionError(statsResult);
    }

    const insights: GeneratedInsight[] = [];

    insights.push(regressionSummary(statsResult));

    const getCorrelationStrength = correlationStrength(options);
    insights.push(getCorrelationStrength(statsResult));

    return {
        ok: true,
        insights
    };
}