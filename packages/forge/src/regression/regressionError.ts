import type { RegressionError } from "@statili/stats";
import type { InsightResultError } from "../types";

/**
 * @function regressionError
 * @description Translates a technical @statili/stats error into a user-friendly insight error.
 * @param {LinearRegressionErrorResult} errorResult - The error result from @statili/stats linear regression.
 * @returns {InsightResultError} A user-friendly error object.
 */
export const regressionError = (errorResult: RegressionError): InsightResultError => {
    switch (errorResult.errorType) {
        case "InsufficientData":
            return {
                ok: false,
                message: "Unable to calculate trend: Not enough data points.",
                helpText: "Linear regression requires at least two distinct data points. Please provide more data.",
                originalErrorType: errorResult.errorType
            };
        case "InvalidInput":
            return {
                ok: false,
                message: "Invalid data provided.",
                helpText: "Ensure your data only contains valid numerical values (e.g., no 'null', 'undefined', or non-numeric strings).",
                originalErrorType: errorResult.errorType
            };
        default:
            return {
                ok: false,
                message: "An unexpected error occurred during linear regression calculation.",
                helpText: "Please contact support with the details of the data you were trying to analyze.",
                originalErrorType: errorResult.errorType
            };
    }
};
