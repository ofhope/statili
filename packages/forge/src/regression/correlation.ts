import { curry } from "@statili/fp";
import type { RegressionSuccess } from "@statili/stats";
import type { GeneratedInsight, LinearInsightGenerationOptions } from "../types";


/**
 * @function generateCorrelationStrengthInsight
 * @description Generates an insight regarding the strength of the linear correlation based on R-squared.
 * @param {LinearInsightGenerationOptions} options - Configuration options for insight generation.
 * @param {LinearRegressionSuccessResult} result - The successful result from @statili/stats linear regression.
 * @returns {GeneratedInsight} An insight about correlation strength.
 */
export const correlationStrength = curry((options: LinearInsightGenerationOptions, result: RegressionSuccess): GeneratedInsight => {
    const { rSquared } = result;
    const rSqWeak = options.rSquaredThresholdWeak ?? 0.3;
    const rSqStrong = options.rSquaredThresholdStrong ?? 0.7;

    let summary = '';
    if (rSquared >= rSqStrong) {
        summary = `There is a strong linear correlation (R-squared: ${rSquared.toFixed(2)}), indicating the model explains a large portion of the variance.`;
    } else if (rSquared >= rSqWeak) {
        summary = `There is a moderate linear correlation (R-squared: ${rSquared.toFixed(2)}).`;
    } else {
        summary = `There is a weak linear correlation (R-squared: ${rSquared.toFixed(2)}), suggesting the linear model may not be the best fit or other factors are at play.`;
    }

    return {
        summary,
        type: 'CorrelationStrength',
        data: { rSquared }
    };
});


