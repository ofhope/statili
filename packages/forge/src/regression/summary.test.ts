import { describe, it, expect } from "vitest";
import type { RegressionSuccess } from "@statili/stats";
import { regressionSummary } from "./summary";

const createMockRegressionSuccess = (overrides: Partial<RegressionSuccess> = {}): RegressionSuccess => ({
  ok: true,
  slope: 2.5,
  intercept: 10,
  r2: 0.85,
  rmse: 1.2,
  n: 50,
  method: "linear",
  points: [[1, 12.5], [2, 15], [3, 17.5], [4, 20]],
  predict: (x: number) => [x, 2.5 * x + 10],
  pValueM: 0.01,
  seM: 0.2,
  tM: 12.5,
  df: 48,
  ...overrides,
});

describe("regressionSummary", () => {
  describe("trend analysis", () => {
    it("should generate insights for a positive trend", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: 2.5, intercept: 10 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("positive linear trend");
      expect(result.summary).toContain("X increases, Y tends to increase");
      expect(result.type).toBe("TrendDescription");
      expect(result.data).toEqual({ slope: 2.5, intercept: 10, rmse: 1.2, n: 50 });
      expect(result.annotations).toContain("drawTrendLine:2.5,10");
    });

    it("should generate insights for a negative trend", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: -1.5, intercept: 20 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("negative linear trend");
      expect(result.summary).toContain("X increases, Y tends to decrease");
      expect(result.type).toBe("TrendDescription");
      expect(result.data).toEqual({ slope: -1.5, intercept: 20, rmse: 1.2, n: 50 });
      expect(result.annotations).toContain("drawTrendLine:-1.5,20");
    });

    it("should generate insights for no trend (slope = 0)", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: 0, intercept: 15 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("no significant linear trend");
      expect(result.summary).toContain("Y remains relatively constant");
      expect(result.type).toBe("TrendDescription");
      expect(result.data).toEqual({ slope: 0, intercept: 15, rmse: 1.2, n: 50 });
      expect(result.annotations).toContain("drawTrendLine:0,15");
    });
  });

  describe("small sample warning", () => {
    it("should not add a small-sample annotation when n is above default threshold", () => {
      const mockSuccess = createMockRegressionSuccess({ n: 50 });
      const result = regressionSummary(mockSuccess);

      const hasWarning = result.annotations?.some(a => a.startsWith("smallSampleWarning"));
      expect(hasWarning).toBe(false);
    });

    it("should add a small-sample annotation when n is below default threshold (20)", () => {
      const mockSuccess = createMockRegressionSuccess({ n: 10 });
      const result = regressionSummary(mockSuccess);

      const hasWarning = result.annotations?.some(a => a.startsWith("smallSampleWarning"));
      expect(hasWarning).toBe(true);
      expect(result.annotations).toContain("smallSampleWarning:n=10");
    });

    it("should respect a custom smallSampleThreshold option", () => {
      const mockSuccess = createMockRegressionSuccess({ n: 30 });
      const result = regressionSummary(mockSuccess, { smallSampleThreshold: 50 });

      const hasWarning = result.annotations?.some(a => a.startsWith("smallSampleWarning"));
      expect(hasWarning).toBe(true);
    });

    it("should not warn when n equals the threshold exactly", () => {
      const mockSuccess = createMockRegressionSuccess({ n: 20 });
      const result = regressionSummary(mockSuccess);

      // n < threshold, not <=, so n=20 with threshold=20 should NOT warn
      const hasWarning = result.annotations?.some(a => a.startsWith("smallSampleWarning"));
      expect(hasWarning).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle very small slope values", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: 0.0001, intercept: 10 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("positive linear trend");
      expect(result.annotations).toContain("drawTrendLine:0.0001,10");
    });

    it("should handle very large slope values", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: 1000000, intercept: 10 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("positive linear trend");
      expect(result.annotations).toContain("drawTrendLine:1000000,10");
    });

    it("should handle negative intercept values", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: 2.5, intercept: -5 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("positive linear trend");
      expect(result.annotations).toContain("drawTrendLine:2.5,-5");
    });

    it("should handle large negative slope values", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: -100, intercept: 50 });
      const result = regressionSummary(mockSuccess);

      expect(result.summary).toContain("negative linear trend");
      expect(result.annotations).toContain("drawTrendLine:-100,50");
    });
  });

  describe("output structure", () => {
    it("should return correct structure with all required fields", () => {
      const mockSuccess = createMockRegressionSuccess();
      const result = regressionSummary(mockSuccess);

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("annotations");
      expect(typeof result.summary).toBe("string");
      expect(result.type).toBe("TrendDescription");
      expect(result.data).toHaveProperty("slope");
      expect(result.data).toHaveProperty("intercept");
      expect(result.data).toHaveProperty("rmse");
      expect(result.data).toHaveProperty("n");
      expect(Array.isArray(result.annotations)).toBe(true);
    });

    it("should always include trend line annotation", () => {
      const mockSuccess = createMockRegressionSuccess({ slope: 5, intercept: -3 });
      const result = regressionSummary(mockSuccess);

      const trendAnnotation = result.annotations?.find(a => a.startsWith("drawTrendLine:"));
      expect(trendAnnotation).toBeDefined();
      expect(trendAnnotation).toContain("5,-3");
    });
  });
});
