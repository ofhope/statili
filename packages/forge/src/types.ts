/**
 * Configuration options for linear regression insight generation.
 * All thresholds are optional — sensible defaults are applied when omitted.
 */
export interface LinearInsightGenerationOptions {
  /**
   * R² value below which the correlation is considered weak.
   * @default 0.3
   */
  rSquaredThresholdWeak?: number;
  /**
   * R² value at or above which the correlation is considered strong.
   * @default 0.7
   */
  rSquaredThresholdStrong?: number;
  /**
   * Alpha level for statistical significance testing on the slope p-value.
   * @default 0.05
   */
  pValueSignificanceLevel?: number;
  /**
   * Z-score threshold beyond which a residual is flagged as an outlier.
   * @default 3
   */
  outlierZScoreThreshold?: number;
  /**
   * Sample size below which a small-sample warning is included in the insights.
   * @default 20
   */
  smallSampleThreshold?: number;
}

/**
 * A single generated insight from @statili/forge.
 */
export type GeneratedInsight = {
  /**
   * A concise, human-readable summary of the insight, suitable for display to end-users.
   */
  summary: string;
  /**
   * Programmatic type identifier for this insight, enabling conditional UI rendering.
   * Examples: 'TrendDescription', 'CorrelationStrength', 'OutlierWarning', 'SmallSampleWarning'.
   */
  type: string;
  /**
   * Structured data related to this insight, for downstream use (e.g. chart annotation logic).
   */
  data?: Record<string, unknown>;
  /**
   * Optional array of annotation instructions for charting libraries.
   * Example: `["drawTrendLine:1.5,2.3"]`
   */
  annotations?: string[];
};

/**
 * Successful output from an insight generation function.
 */
export type InsightResultSuccess = {
  ok: true;
  insights: GeneratedInsight[];
};

/**
 * Error output from an insight generation function.
 * Translates a technical @statili/stats error into user-facing language.
 */
export type InsightResultError = {
  ok: false;
  /** User-facing explanation of why insights could not be generated. */
  message: string;
  /** Actionable suggestion for the user to resolve the issue. */
  helpText: string;
  /** The original `errorType` from @statili/stats, retained for debugging. */
  originalErrorType: string;
};
