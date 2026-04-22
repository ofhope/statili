import { describe, it, expect } from "vitest";
import type { RegressionSuccess } from '@statili/stats';
import { regressionSummary } from "./summary";

// Mock data generator for testing
const createMockRegressionSuccess = (overrides: Partial<RegressionSuccess> = {}): RegressionSuccess => ({
    ok: true,
    m: 2.5,
    b: 10,
    rSquared: 0.85,
    method: "linear",
    points: [[1, 12.5], [2, 15], [3, 17.5], [4, 20]],
    predict: (x: number) => [x, 2.5 * x + 10],
    pValueM: 0.01,
    seM: 0.2,
    tM: 12.5,
    df: 2,
    ...overrides
});

describe("regressionSummary", () => {
    describe("trend analysis", () => {
        it("should generate insights for a positive trend", () => {
            const mockSuccess = createMockRegressionSuccess({
                m: 2.5,
                b: 10
            });

            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('positive linear trend');
            expect(result.summary).toContain('X increases, Y tends to increase');
            expect(result.type).toBe('TrendDescription');
            expect(result.data).toEqual({ m: 2.5, b: 10 });
            expect(result.annotations).toEqual(['drawTrendLine:2.5,10']);
        });

        it("should generate insights for a negative trend", () => {
            const mockSuccess = createMockRegressionSuccess({
                m: -1.5,
                b: 20
            });

            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('negative linear trend');
            expect(result.summary).toContain('X increases, Y tends to decrease');
            expect(result.type).toBe('TrendDescription');
            expect(result.data).toEqual({ m: -1.5, b: 20 });
            expect(result.annotations).toEqual(['drawTrendLine:-1.5,20']);
        });

        it("should generate insights for no trend (slope = 0)", () => {
            const mockSuccess = createMockRegressionSuccess({
                m: 0,
                b: 15
            });

            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('no significant linear trend');
            expect(result.summary).toContain('Y remains relatively constant');
            expect(result.type).toBe('TrendDescription');
            expect(result.data).toEqual({ m: 0, b: 15 });
            expect(result.annotations).toEqual(['drawTrendLine:0,15']);
        });
    });

    describe("edge cases", () => {
        it("should handle very small slope values", () => {
            const mockSuccess = createMockRegressionSuccess({ m: 0.0001, b: 10 });
            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('positive linear trend');
            expect(result.data).toEqual({ m: 0.0001, b: 10 });
            expect(result.annotations).toEqual(['drawTrendLine:0.0001,10']);
        });

        it("should handle very large slope values", () => {
            const mockSuccess = createMockRegressionSuccess({ m: 1000000, b: 10 });
            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('positive linear trend');
            expect(result.data).toEqual({ m: 1000000, b: 10 });
            expect(result.annotations).toEqual(['drawTrendLine:1000000,10']);
        });

        it("should handle negative intercept values", () => {
            const mockSuccess = createMockRegressionSuccess({ m: 2.5, b: -5 });
            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('positive linear trend');
            expect(result.data).toEqual({ m: 2.5, b: -5 });
            expect(result.annotations).toEqual(['drawTrendLine:2.5,-5']);
        });

        it("should handle large negative slope values", () => {
            const mockSuccess = createMockRegressionSuccess({ m: -100, b: 50 });
            const result = regressionSummary(mockSuccess);

            expect(result.summary).toContain('negative linear trend');
            expect(result.data).toEqual({ m: -100, b: 50 });
            expect(result.annotations).toEqual(['drawTrendLine:-100,50']);
        });
    });

    describe("output structure", () => {
        it("should return correct structure", () => {
            const mockSuccess = createMockRegressionSuccess();
            const result = regressionSummary(mockSuccess);

            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('annotations');
            expect(typeof result.summary).toBe('string');
            expect(result.type).toBe('TrendDescription');
            expect(result.data).toHaveProperty('m');
            expect(result.data).toHaveProperty('b');
            expect(Array.isArray(result.annotations)).toBe(true);
        });

        it("should always include trend line annotation", () => {
            const mockSuccess = createMockRegressionSuccess({ m: 5, b: -3 });
            const result = regressionSummary(mockSuccess);

            expect(result.annotations).toHaveLength(1);
            expect(result.annotations![0]).toMatch(/^drawTrendLine:/);
            expect(result.annotations![0]).toContain('5,-3');
        });
    });
});
