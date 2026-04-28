/**
 * Common interface for the successful output of all regression methods.
 */
export interface RegressionSuccess {
  ok: true;
  /**
   * The slope (gradient) of the fitted regression line.
   * Represents the change in the dependent variable (Y) for a one-unit change
   * in the independent variable (X).
   */
  slope: number;
  /**
   * The Y-intercept of the fitted regression line.
   * Represents the expected value of Y when X is zero.
   */
  intercept: number;
  /**
   * The coefficient of determination (R²).
   * Represents the proportion of variance in Y explained by X.
   * Ranges from 0 (no explanatory power) to 1 (perfect fit).
   */
  r2: number;
  /**
   * Root Mean Squared Error — the standard deviation of the residuals.
   * Expressed in the same units as Y, making it directly interpretable:
   * a model with rmse of 4.2 produces predictions within roughly ±4.2 units on average.
   */
  rmse: number;
  /**
   * The number of valid data points (n) used to fit the model.
   * Essential for downstream consumers (e.g. @statili/forge) to generate
   * appropriate small-sample warnings.
   */
  n: number;
  /**
   * The statistical method used, providing context for interpretation downstream.
   */
  method: "linear" | "logarithmic" | "exponential" | "power" | "polynomial";
  /**
   * An array of [x, y] points representing the fitted regression line,
   * generated from the input data points. Useful for directly plotting
   * the regression line on a chart.
   */
  points: PredictedPoint[];
  /**
   * A function that takes an x-value and returns its predicted [x, y] point
   * based on the calculated regression equation.
   */
  predict: (x: number) => PredictedPoint;
  /**
   * The p-value associated with the slope.
   * Indicates the statistical significance of the relationship between X and Y.
   * A small p-value (e.g., < 0.05) suggests a statistically significant trend.
   * Null if it could not be computed (e.g., insufficient data for SE calculation).
   */
  pValueM?: number | null;
  /**
   * The standard error of the slope. Measures the accuracy of the slope coefficient.
   * Null if it could not be computed.
   */
  seM?: number | null;
  /**
   * The t-statistic for the slope (slope / seM).
   * Used to determine p-value and statistical significance.
   * Null if it could not be computed.
   */
  tM?: number | null;
  /**
   * Degrees of freedom for the regression model's error term.
   * Used with the t-statistic to determine p-values and confidence intervals.
   * Null if not applicable.
   */
  df?: number | null;
}

/**
 * Interface for the error output of regression methods.
 */
export interface RegressionError {
  ok: false;
  /**
   * The statistical method that was attempted, providing context for error interpretation.
   * Optional — included where the method is known at the point of failure.
   */
  method?: "linear" | "logarithmic" | "exponential" | "power" | "polynomial";
  errorType:
    | "InsufficientData"
    | "DegenerateInput"
    | "MathError"
    | "InvalidInput"
    | "NumericalStability";
  message: string;
}

/**
 * Discriminant union type for the result of regression methods,
 * indicating either a successful computation or a detailed error.
 */
export type RegressionResult = RegressionSuccess | RegressionError;

/**
 * Represents a predicted data point as a [x, predictedY] tuple.
 */
export type PredictedPoint = [number, number];

/**
 * Represents an observed data point as a [x, y] tuple.
 */
export type DataPoint = [number, number];

/**
 * Options interface for regression methods.
 */
export interface RegressionOptions {
  /**
   * The number of decimal places to round numerical results to.
   */
  precision: number;
}
