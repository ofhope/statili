/**
 * Common interface for the successful output of all regression methods.
 */
export interface RegressionSuccess {
  ok: true;
  /**
   * The slope (gradient) of the fitted linear regression line.
   * Represents the change in the dependent variable (Y) for a one-unit change in the independent variable (X).
   */
  m: number;
  /**
   * The Y-intercept of the fitted linear regression line.
   * Represents the expected value of the dependent variable (Y) when the independent variable (X) is zero.
   */
  b: number;
  /**
   * The R-squared value, a statistical measure that represents the proportion of the variance
   * for a dependent variable that's explained by an independent variable or variables in a regression model.
   * Values range from 0 to 1, with higher values indicating a better fit.
   */
  rSquared: number;
  /**
   * The method used for the statistical calculation, providing context for interpretation.
   */
  method: "linear" | "logarithmic" | "exponential" | "power" | "polynomial";
  /**
   * An array of [x, y] points representing the fitted regression line,
   * generated from the input data points based on the calculated equation.
   * Useful for directly plotting the regression line on a chart.
   */
  points: PredictedPoint[];
  /**
   * A function that takes an x-value and returns its predicted y-value
   * based on the calculated linear regression equation (y = mx + b).
   */
  predict: (x: number) => PredictedPoint;
  /**
   * The p-value associated with the slope (m) of the regression line.
   * Indicates the statistical significance of the linear relationship between X and Y.
   * A small p-value (e.g., < 0.05) suggests a statistically significant trend.
   * Null if it could not be computed (e.g., due to zero variance or insufficient data for SE_m calculation).
   */
  pValueM?: number | null;
  /**
   * The standard error of the slope (m). It measures the accuracy of the slope coefficient,
   * indicating the average distance that the estimated slope is from the true population slope.
   * Null if it could not be computed.
   */
  seM?: number | null;
  /**
   * The t-statistic for the slope (m). It is calculated as m / seM and is used to determine
   * the p-value and statistical significance of the slope.
   * Null if it could not be computed.
   */
  tM?: number | null;
  /**
   * The degrees of freedom for the regression model's error term.
   * Used in conjunction with the t-statistic to determine p-values and confidence intervals.
   * Null if it could not be computed or is not applicable.
   */
  df?: number | null;
}


/**
 * Interface for the error output of regression methods.
 */
export interface RegressionError {
  ok: false;
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
 * Represents a predicted data point with an x and predicted y value.
 */
export type PredictedPoint = [number, number];

/**
 * Represents a data point with an x and y value.
 */
export type DataPoint = [number, number];

/**
 * Options interface for regression methods.
 */
export interface RegressionOptions {
  /**
   * The precision for rounding numerical results.
   */
  precision: number;
}
