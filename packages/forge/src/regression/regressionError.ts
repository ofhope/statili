import type { RegressionError, MultiRegressionError } from "@statili/stats";
import type { InsightResultError } from "../types";

export const regressionError = (errorResult: RegressionError | MultiRegressionError): InsightResultError => {
  switch (errorResult.errorType) {
    case "InsufficientData":
      return {
        ok: false,
        message: "Unable to calculate trend: Not enough data points.",
        helpText: "Provide at least two distinct data points to fit a regression line.",
        originalErrorType: errorResult.errorType,
      };
    case "DegenerateInput":
      return {
        ok: false,
        message: "Unable to determine a trend: all X values are identical.",
        helpText:
          "The independent variable (X) must vary across data points. " +
          "Check that your X-axis data contains more than one distinct value.",
        originalErrorType: errorResult.errorType,
      };
    case "InvalidInput":
      return {
        ok: false,
        message: "Invalid data provided.",
        helpText:
          "Ensure your data contains only valid numerical values. " +
          "Remove or replace any null, undefined, NaN, or non-numeric entries.",
        originalErrorType: errorResult.errorType,
      };
    case "MathError":
      return {
        ok: false,
        message: "A mathematical error occurred during regression.",
        helpText:
          "This can happen when all Y values are identical (no variance to model), " +
          "or with extremely large/small numbers causing floating-point overflow.",
        originalErrorType: errorResult.errorType,
      };
    case "NumericalStability":
      return {
        ok: false,
        message: "The regression could not produce a stable result.",
        helpText:
          "This typically occurs with highly correlated features (multicollinearity) " +
          "or insufficient variation in the input data. " +
          "Consider reviewing your data or using a different model.",
        originalErrorType: errorResult.errorType,
      };
    default:
      return {
        ok: false,
        message: "An unexpected error occurred during regression calculation.",
        helpText: "Please review your input data and try again.",
        originalErrorType: (errorResult as RegressionError).errorType,
      };
  }
};
