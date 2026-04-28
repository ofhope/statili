import { describe, it, expect } from "vitest";
import type { RegressionSuccess } from '@statili/stats';
import { correlationStrength } from "./correlation";
import type { LinearInsightGenerationOptions } from "../types";

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

describe("correlationStrength", () => {
    const defaultOptions: LinearInsightGenerationOptions = {
        rSquaredThresholdWeak: 0.3,
        rSquaredThresholdStrong: 0.7,
        pValueSignificanceLevel: 0.05,
        outlierZScoreThreshold: 3
    };

    describe("correlation strength classification", () => {
        it("should classify correlation strength correctly - strong", () => {
            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.8 });
            const getCorrelationStrength = correlationStrength(defaultOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('strong linear correlation');
            expect(result.summary).toContain('0.80');
            expect(result.type).toBe('CorrelationStrength');
            expect(result.data).toEqual({ rSquared: 0.8 });
        });

        it("should classify correlation strength correctly - moderate", () => {
            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.5 });
            const getCorrelationStrength = correlationStrength(defaultOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('moderate linear correlation');
            expect(result.summary).toContain('0.50');
            expect(result.type).toBe('CorrelationStrength');
            expect(result.data).toEqual({ rSquared: 0.5 });
        });

        it("should classify correlation strength correctly - weak", () => {
            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.1 });
            const getCorrelationStrength = correlationStrength(defaultOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('weak linear correlation');
            expect(result.summary).toContain('0.10');
            expect(result.summary).toContain('may not be the best fit');
            expect(result.type).toBe('CorrelationStrength');
            expect(result.data).toEqual({ rSquared: 0.1 });
        });
    });

    describe("custom thresholds", () => {
        it("should use custom thresholds for correlation strength", () => {
            const customOptions: LinearInsightGenerationOptions = {
                ...defaultOptions,
                rSquaredThresholdWeak: 0.5,
                rSquaredThresholdStrong: 0.9
            };

            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.6 });
            const getCorrelationStrength = correlationStrength(customOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('moderate linear correlation');
            expect(result.summary).toContain('0.60');
        });

        it("should use default thresholds when not provided", () => {
            const optionsWithoutThresholds: LinearInsightGenerationOptions = {};
            
            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.5 });
            const getCorrelationStrength = correlationStrength(optionsWithoutThresholds);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('moderate linear correlation');
        });
    });

    describe("boundary conditions", () => {
        it("should handle R-squared exactly at threshold boundaries", () => {
            // Test exact weak threshold
            let mockSuccess = createMockRegressionSuccess({ rSquared: 0.3 });
            let getCorrelationStrength = correlationStrength(defaultOptions);
            let result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('moderate');

            // Test exact strong threshold
            mockSuccess = createMockRegressionSuccess({ rSquared: 0.7 });
            getCorrelationStrength = correlationStrength(defaultOptions);
            result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('strong');
        });

        it("should handle perfect correlation (R-squared = 1)", () => {
            const mockSuccess = createMockRegressionSuccess({ rSquared: 1.0 });
            const getCorrelationStrength = correlationStrength(defaultOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('strong linear correlation');
            expect(result.summary).toContain('1.00');
            expect(result.data).toEqual({ rSquared: 1.0 });
        });

        it("should handle no correlation (R-squared = 0)", () => {
            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.0 });
            const getCorrelationStrength = correlationStrength(defaultOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result.summary).toContain('weak linear correlation');
            expect(result.summary).toContain('0.00');
            expect(result.data).toEqual({ rSquared: 0.0 });
        });
    });

    describe("output structure", () => {
        it("should return correct structure", () => {
            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.8 });
            const getCorrelationStrength = correlationStrength(defaultOptions);
            const result = getCorrelationStrength(mockSuccess);

            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('data');
            expect(typeof result.summary).toBe('string');
            expect(result.type).toBe('CorrelationStrength');
            expect(result.data).toHaveProperty('rSquared');
        });
    });
});
