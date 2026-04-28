import { describe, it, expect} from "vitest";
import type { RegressionSuccess, RegressionError } from '@statili/stats';
import { linearRegressionInsights } from "./linear";

// Mock data generators for testing
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

const createMockRegressionError = (errorType: RegressionError['errorType'], message: string = "Error"): RegressionError => ({
    ok: false,
    errorType,
    message
});

describe("linearRegressionInsights", () => {
    const defaultOptions = {
        rSquaredThresholdWeak: 0.3,
        rSquaredThresholdStrong: 0.7,
        pValueSignificanceLevel: 0.05,
        outlierZScoreThreshold: 3
    };

    describe("insight orchestration", () => {
        it("should generate all expected insights for successful regression", () => {
            const mockSuccess = createMockRegressionSuccess({
                m: 2.5,
                b: 10,
                rSquared: 0.85
            });

            const result = linearRegressionInsights(defaultOptions, mockSuccess);

            if (!result.ok) {
                throw new Error("Expected result to be ok");
            }

            // Should generate both trend and correlation insights
            expect(result.insights).toHaveLength(2);
            
            // Check that both insight types are present
            const insightTypes = result.insights.map(insight => insight.type);
            expect(insightTypes).toContain('TrendDescription');
            expect(insightTypes).toContain('CorrelationStrength');
        });

        it("should maintain insight order (summary first, then correlation)", () => {
            const mockSuccess = createMockRegressionSuccess();
            const result = linearRegressionInsights(defaultOptions, mockSuccess);

            if (!result.ok) {
                throw new Error("Expected result to be ok");
            }

            expect(result.insights[0].type).toBe('TrendDescription');
            expect(result.insights[1].type).toBe('CorrelationStrength');
        });

        it("should handle regression errors properly", () => {
            const mockError = createMockRegressionError("InsufficientData", "Not enough data points");
            const result = linearRegressionInsights(defaultOptions, mockError);

            if (result.ok) {
                throw new Error("Expected result to be an error");
            }
            
            expect(result.message).toContain("Not enough data points");
            expect(result.helpText).toContain("at least two distinct data points");
            expect(result.originalErrorType).toBe("InsufficientData");
        });

        it("should pass options correctly to internal functions", () => {
            const customOptions = {
                ...defaultOptions,
                rSquaredThresholdWeak: 0.5,
                rSquaredThresholdStrong: 0.9
            };

            const mockSuccess = createMockRegressionSuccess({ rSquared: 0.6 });
            const result = linearRegressionInsights(customOptions, mockSuccess);

            if (!result.ok) {
                throw new Error("Expected result to be ok");
            }

            // Should still generate both insights with custom options
            expect(result.insights).toHaveLength(2);
            const insightTypes = result.insights.map(insight => insight.type);
            expect(insightTypes).toContain('TrendDescription');
            expect(insightTypes).toContain('CorrelationStrength');
        });
    });

    describe("error handling", () => {
        it("should handle InsufficientData error", () => {
            const mockError = createMockRegressionError("InsufficientData");
            const result = linearRegressionInsights(defaultOptions, mockError);

            if (result.ok) {
                throw new Error("Expected result to be an error");
            }
            
            expect(result.originalErrorType).toBe("InsufficientData");
        });

        it("should handle InvalidInput error", () => {
            const mockError = createMockRegressionError("InvalidInput");
            const result = linearRegressionInsights(defaultOptions, mockError);

            if (result.ok) {
                throw new Error("Expected result to be an error");
            }
            
            expect(result.originalErrorType).toBe("InvalidInput");
        });

        it("should handle unknown error types", () => {
            const mockError = createMockRegressionError("MathError");
            const result = linearRegressionInsights(defaultOptions, mockError);

            if (result.ok) {
                throw new Error("Expected result to be an error");
            }
            
            expect(result.originalErrorType).toBe("MathError");
        });
    });

    describe("options handling", () => {
        it("should work with empty options object", () => {
            const mockSuccess = createMockRegressionSuccess();
            const result = linearRegressionInsights({}, mockSuccess);

            if (!result.ok) {
                throw new Error("Expected result to be ok");
            }
            
            expect(result.insights).toHaveLength(2);
        });

        it("should work with partial options", () => {
            const partialOptions = {
                rSquaredThresholdWeak: 0.4
                // Other options should use defaults
            };

            const mockSuccess = createMockRegressionSuccess();
            const result = linearRegressionInsights(partialOptions, mockSuccess);

            if (!result.ok) {
                throw new Error("Expected result to be ok");
            }
            
            expect(result.insights).toHaveLength(2);
        });
    });

    describe("output structure validation", () => {
        it("should return correct structure for success case", () => {
            const mockSuccess = createMockRegressionSuccess();
            const result = linearRegressionInsights(defaultOptions, mockSuccess);

            expect(result).toHaveProperty('ok');
            
            if (!result.ok) {
                throw new Error("Expected result to be ok");
            }
            
            expect(result).toHaveProperty('insights');
            expect(Array.isArray(result.insights)).toBe(true);
            
            result.insights.forEach(insight => {
                expect(insight).toHaveProperty('summary');
                expect(insight).toHaveProperty('type');
                expect(typeof insight.summary).toBe('string');
                expect(typeof insight.type).toBe('string');
            });
        });

        it("should return correct structure for error case", () => {
            const mockError = createMockRegressionError("InvalidInput");
            const result = linearRegressionInsights(defaultOptions, mockError);

            expect(result).toHaveProperty('ok');
            
            if (result.ok) {
                throw new Error("Expected result to be an error");
            }
            
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('helpText');
            expect(result).toHaveProperty('originalErrorType');
            expect(typeof result.message).toBe('string');
            expect(typeof result.helpText).toBe('string');
        });
    });
});
