export type DataPoint = [number, number];
export type PredictedPoint = [number, number];

export type RegressionErrorType =
  | "InsufficientData"
  | "DegenerateInput"
  | "MathError"
  | "InvalidInput"
  | "NumericalStability";

export interface RegressionSuccess {
  ok: true;
  /** Primary slope / rate-of-change coefficient.
   * linear: slope m | polynomial: c1 | power: exponent b | logarithmic: ln-coeff b */
  slope: number;
  /** Y-intercept or constant term.
   * linear: y-int | polynomial: c0 | power: scale a | logarithmic: constant a */
  intercept: number;
  /** Coefficient of determination R2 in [0,1]. */
  r2: number;
  /** Root Mean Squared Error in the same units as Y. */
  rmse: number;
  /** Number of valid data points used. */
  n: number;
  method: "linear" | "logarithmic" | "exponential" | "power" | "polynomial";
  points: PredictedPoint[];
  predict: (x: number) => PredictedPoint;
  /** Full coefficient vector [c0,c1,...,cn] for polynomial. */
  coefficients?: number[];
  /** Polynomial degree. */
  degree?: number;
  /** Human-readable equation string. */
  equation?: string;
  pValueM?: number | null;
  seM?: number | null;
  tM?: number | null;
  df?: number | null;
}

export interface RegressionError {
  ok: false;
  method?: "linear" | "logarithmic" | "exponential" | "power" | "polynomial";
  errorType: RegressionErrorType;
  message: string;
}

export type RegressionResult = RegressionSuccess | RegressionError;

export interface RegressionOptions {
  /** Decimal places for rounding. @default 2 */
  precision: number;
  /** Polynomial degree (polynomial() only). @default 2 */
  order?: number;
}

// ── Multi-feature types ──────────────────────────────────────────────────────

export type MultiDataPoint = { x: number[]; y: number | null };
export type PredictedMultiPoint = { x: number[]; y: number };

export interface MultiRegressionSuccess {
  ok: true;
  method: "multilinear" | "logistic";
  /** [intercept, b1, b2, ..., bk] */
  coefficients: number[];
  numFeatures: number;
  /** R2 for multilinear; McFadden pseudo-R2 for logistic. */
  r2: number;
  /** RMSE on training set. NaN for logistic. */
  rmse: number;
  n: number;
  points: PredictedMultiPoint[];
  predict: (x: number[]) => PredictedMultiPoint;
  equation: string;
  /** Training accuracy at 0.5 threshold (logistic only). */
  accuracy?: number;
}

export interface MultiRegressionError {
  ok: false;
  method?: "multilinear" | "logistic";
  errorType: RegressionErrorType;
  message: string;
}

export type MultiRegressionResult = MultiRegressionSuccess | MultiRegressionError;

export interface LogisticRegressionOptions {
  /** Gradient descent learning rate. @default 0.1 */
  learningRate: number;
  /** Number of gradient descent iterations. @default 1000 */
  iterations: number;
  /** Decimal places for rounding. @default 4 */
  precision: number;
}
