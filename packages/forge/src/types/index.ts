/**
 * @typedef LinearInsightGenerationOptions
 * @property {number} [rSquaredThresholdWeak=0.3] - R-squared value below which correlation is considered weak.
 * @property {number} [rSquaredThresholdStrong=0.7] - R-squared value above which correlation is considered strong.
 * @property {number} [pValueSignificanceLevel=0.05] - Alpha level for statistical significance.
 * @property {number} [outlierZScoreThreshold=3] - Z-score threshold for identifying outliers in residuals.
 */
export interface LinearInsightGenerationOptions {
    rSquaredThresholdWeak?: number;
    rSquaredThresholdStrong?: number;
    pValueSignificanceLevel?: number;
    outlierZScoreThreshold?: number;
}

/**
 * @typedef GeneratedInsight
 * @property {string} summary - A concise natural language summary of the insight.
 * @property {string} type - A programmatic type for the insight (e.g., 'TrendDescription', 'CorrelationStrength', 'OutlierWarning').
 * @property {any} [data] - Optional, structured data related to the insight (e.g., indices of outliers, specific values).
 * @property {string[]} [chartAnnotations] - Optional, an array of instructions or data for visual annotations.
 */
export type GeneratedInsight = {
    summary: string;
    type: string;
    data?: any;
    annotations?: string[]; // Example: ["drawTrendLine", "highlightOutlier: [5, 10]"]
};

/**
 * @typedef InsightResultSuccess
 * @property {true} ok - Indicates successful insight generation.
 * @property {GeneratedInsight[]} insights - An array of generated insights.
 */
export type InsightResultSuccess = {
    ok: true;
    insights: GeneratedInsight[];
};

/**
 * @typedef InsightResultError
 * @property {false} ok - Indicates an error during insight generation.
 * @property {string} message - A user-friendly error message.
 * @property {string} helpText - Suggestions for the user to resolve the issue.
 * @property {string} originalErrorType - The errorType from @facta/stats for debugging.
 */
export type InsightResultError = {
    ok: false;
    message: string;
    helpText: string;
    originalErrorType: string; // Maps to errorType from @facta/stats
};

