interface CommonInsightOptions {
  rSquaredThresholdWeak?: number;
  rSquaredThresholdStrong?: number;
  smallSampleThreshold?: number;
}

export interface LinearInsightGenerationOptions extends CommonInsightOptions {
  pValueSignificanceLevel?: number;
  outlierZScoreThreshold?: number;
}

export interface PolynomialInsightGenerationOptions extends CommonInsightOptions {
  /** Ratio degree/n above which an overfit warning fires. @default 0.33 */
  overfitRatioThreshold?: number;
}

export interface PowerInsightGenerationOptions extends CommonInsightOptions {
  /** |b - 1| below this => near-linear. @default 0.1 */
  nearLinearThreshold?: number;
}

export interface LogarithmicInsightGenerationOptions extends CommonInsightOptions {}

export interface MultilinearInsightGenerationOptions extends CommonInsightOptions {}

export interface LogisticInsightGenerationOptions {
  /** Accuracy below this triggers a warning. @default 0.7 */
  accuracyWarningThreshold?: number;
  /** McFadden pseudo-R2 threshold (weak). @default 0.2 */
  pseudoR2ThresholdWeak?: number;
  /** McFadden pseudo-R2 threshold (strong). @default 0.4 */
  pseudoR2ThresholdStrong?: number;
  smallSampleThreshold?: number;
}

export type GeneratedInsight = {
  summary: string;
  type: string;
  data?: Record<string, unknown>;
  annotations?: string[];
};

export type InsightResultSuccess = {
  ok: true;
  insights: GeneratedInsight[];
};

export type InsightResultError = {
  ok: false;
  message: string;
  helpText: string;
  originalErrorType: string;
};
