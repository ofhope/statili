import { describe, expect, it } from "vitest";
import { regressionError } from "./regressionError";
import type { RegressionError } from "@statili/stats";

const createMockRegressionError = (
  errorType: RegressionError["errorType"],
  message: string = "Error"
): RegressionError => ({
  ok: false,
  method: "linear",
  errorType,
  message,
});

describe("regressionError", () => {
  it("should handle InsufficientData error", () => {
    const error = createMockRegressionError("InsufficientData");
    const result = regressionError(error);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Not enough data points");
    expect(result.helpText).toContain("at least two distinct data points");
    expect(result.originalErrorType).toBe("InsufficientData");
  });

  it("should handle DegenerateInput error with vertical-line specific guidance", () => {
    const error = createMockRegressionError("DegenerateInput");
    const result = regressionError(error);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("all X values are identical");
    expect(result.helpText).toContain("independent variable (X) to vary");
    expect(result.originalErrorType).toBe("DegenerateInput");
  });

  it("should handle InvalidInput error", () => {
    const error = createMockRegressionError("InvalidInput");
    const result = regressionError(error);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Invalid data provided");
    expect(result.helpText).toContain("valid numerical values");
    expect(result.originalErrorType).toBe("InvalidInput");
  });

  it("should handle MathError with actionable guidance", () => {
    const error = createMockRegressionError("MathError");
    const result = regressionError(error);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("mathematical error");
    expect(result.helpText).toContain("all Y values are identical");
    expect(result.originalErrorType).toBe("MathError");
  });

  it("should handle NumericalStability error", () => {
    const error = createMockRegressionError("NumericalStability");
    const result = regressionError(error);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("stable result");
    expect(result.helpText).toContain("multicollinearity");
    expect(result.originalErrorType).toBe("NumericalStability");
  });
});
