import type { RegressionSuccess } from "@statili/stats";
import type { GeneratedInsight } from "../types";

/**
 * @function regressionSummary
 * @description Generates a natural language summary of the linear regression trend.
 * @param {LinearInsightGenerationOptions} options - Configuration options for insight generation.
 * @param {RegressionSuccess} result - The successful result from @statili/stats linear regression.
 * @returns {GeneratedInsight} A descriptive insight about the trend.
 */
export const regressionSummary = (result: RegressionSuccess): GeneratedInsight => {
    const { m, b } = result;
    let summary = '';
    let chartAnnotations: string[] = [`drawTrendLine:${m},${b}`];

    if (m > 0) {
        summary = `There is a positive linear trend. As X increases, Y tends to increase.`;
    } else if (m < 0) {
        summary = `There is a negative linear trend. As X increases, Y tends to decrease.`;
    } else {
        summary = `There is no significant linear trend. Y remains relatively constant as X changes.`;
    }

    // Add more detail based on p-values if available
    // if (result.pValueM !== undefined && result.pValueM < (options.pValueSignificanceLevel || 0.05)) {
    //     summary += ` The trend is statistically significant (p < ${(options.pValueSignificanceLevel || 0.05)}).`;
    // } else if (result.pValueM !== undefined) {
    //     summary += ` The trend is not statistically significant (p > ${(options.pValueSignificanceLevel || 0.05)}).`;
    // }

    return {
        summary,
        type: 'TrendDescription',
        data: { m, b },
        annotations: chartAnnotations
    };
};