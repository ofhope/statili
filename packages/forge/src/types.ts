export interface GeneratedInsight {
  summary: string;
  type: string;
  data: Record<string, unknown>;
  annotations?: string[];
}

export interface InsightResultSuccess {
  ok: true;
  insights: GeneratedInsight[];
}

export interface InsightResultError {
  ok: false;
  message: string;
  helpText: string;
  originalErrorType: string;
}

export interface LinearInsightGenerationOptions {
  rSquaredThresholdWeak?: number;
  rSquaredThresholdStrong?: number;
}
