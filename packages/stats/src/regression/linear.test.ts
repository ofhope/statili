import { describe, it, expect } from "vitest";
import { linear } from "./linear";
import type { DataPoint } from "./types";

describe("linear", () => {
  it("should correctly calculate linear regression for a perfect positive correlation", () => {
    const data: DataPoint[] = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(1);
    expect(result.intercept).toBeCloseTo(1);
    expect(result.r2).toBeCloseTo(1);
    expect(result.rmse).toBeCloseTo(0);
    expect(result.n).toBe(4);
    expect(result.method).toBe("linear");
    expect(result.predict(5)[1]).toBeCloseTo(6);
    expect(result.points).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ]);
  });

  it("should correctly calculate linear regression for a perfect negative correlation", () => {
    const data: DataPoint[] = [
      [1, 5],
      [2, 4],
      [3, 3],
      [4, 2],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(-1);
    expect(result.intercept).toBeCloseTo(6);
    expect(result.r2).toBeCloseTo(1);
    expect(result.rmse).toBeCloseTo(0);
    expect(result.n).toBe(4);
    expect(result.predict(5)[1]).toBeCloseTo(1);
  });

  it("should correctly calculate linear regression for a horizontal line", () => {
    const data: DataPoint[] = [
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(0);
    expect(result.intercept).toBeCloseTo(5);
    expect(result.r2).toBeCloseTo(1);
    expect(result.rmse).toBeCloseTo(0);
    expect(result.n).toBe(4);
    expect(result.predict(10)[1]).toBeCloseTo(5);
  });

  it("should correctly calculate linear regression for scattered data", () => {
    const data: DataPoint[] = [
      [1, 1],
      [2, 2.5],
      [3, 2.8],
      [4, 4.2],
      [5, 5.1],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    // Manually calculated correct values: y = 0.99x + 0.15, R² ≈ 0.97
    expect(result.slope).toBeCloseTo(0.99);
    expect(result.intercept).toBeCloseTo(0.15);
    expect(result.r2).toBeCloseTo(0.97, 2);
    expect(result.rmse).toBeGreaterThan(0); // Scattered data has non-zero error
    expect(result.n).toBe(5);
    expect(result.predict(6)[1]).toBeCloseTo(6.09);
  });

  it("should handle negative data points correctly", () => {
    const data: DataPoint[] = [
      [-2, -4],
      [-1, -2],
      [0, 0],
      [1, 2],
      [2, 4],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }
    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(0);
    expect(result.r2).toBeCloseTo(1);
    expect(result.n).toBe(5);
  });

  it("should handle mixed positive and negative data points correctly", () => {
    const data: DataPoint[] = [
      [-5, 10],
      [0, 0],
      [5, -10],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(-2);
    expect(result.intercept).toBeCloseTo(0);
    expect(result.r2).toBeCloseTo(1);
    expect(result.n).toBe(3);
  });

  it("should apply precision option correctly", () => {
    const data: DataPoint[] = [
      [1, 1.12345],
      [2, 2.12345],
      [3, 3.12345],
    ];
    const result = linear({ precision: 2 }, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }
    expect(result.slope).toBeCloseTo(1.0);
    expect(result.intercept).toBeCloseTo(0.12);
    expect(result.predict(4)[1]).toBeCloseTo(4.12);
    expect(result.r2).toBeCloseTo(1.0);
  });

  it("should return an error for insufficient data points (less than 2)", () => {
    const data1: DataPoint[] = [];
    const result1 = linear({}, data1);
    expect(result1.ok).toBe(false);
    if (result1.ok) {
      throw new Error("Expected result1 to be unsuccessful");
    }
    expect(result1.errorType).toBe("InsufficientData");
    expect(result1.method).toBe("linear");
    expect(result1.message).toContain("at least 2 data points");

    const data2: DataPoint[] = [[1, 1]];
    const result2 = linear({}, data2);
    if (result2.ok) {
      throw new Error("Expected result2 to be unsuccessful");
    }
    expect(result2.errorType).toBe("InsufficientData");
    expect(result2.method).toBe("linear");
  });

  it("should return an error when all x-values are identical (vertical line)", () => {
    const data: DataPoint[] = [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ];
    const result = linear({}, data);

    if (result.ok) {
      throw new Error("Expected result to be unsuccessful");
    }
    expect(result.errorType).toBe("DegenerateInput");
    expect(result.method).toBe("linear");
    expect(result.message).toContain("all x-values are identical");
  });

  it("should return an error on bad numerical values", () => {
    const data: DataPoint[] = [
      [1, 2],
      [2, NaN],
      [3, 4],
      [4, 5],
      [5, 6],
    ];
    const result = linear({}, data);

    if (result.ok) {
      throw new Error("Expected result to be unsuccessful");
    }
    expect(result.errorType).toBe("InvalidInput");
    expect(result.method).toBe("linear");
    expect(result.message).toContain("Data point at index 1 contains non-finite values");
  });

  it("should handle a large number of data points efficiently and accurately", () => {
    const largeData: [number, number][] = [];
    for (let i = 0; i < 10000; i++) {
      largeData.push([i, i * 2 + 3 + Math.random() * 0.1]);
    }

    const result = linear({}, largeData);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(3, 1);
    expect(result.r2).toBeGreaterThan(0.99);
    expect(result.n).toBe(10000);
    expect(result.rmse).toBeGreaterThanOrEqual(0);
  });

  it("should handle data points with zero values", () => {
    const data: DataPoint[] = [
      [0, 0],
      [1, 10],
      [2, 20],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(10);
    expect(result.intercept).toBeCloseTo(0);
    expect(result.r2).toBeCloseTo(1);
    expect(result.n).toBe(3);
  });

  it("should handle very small numbers without precision issues", () => {
    const data: DataPoint[] = [
      [0.0001, 0.0002],
      [0.0002, 0.0004],
      [0.0003, 0.0006],
    ];
    const result = linear({ precision: 4 }, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(0);
    expect(result.r2).toBeCloseTo(1);
  });

  it("should handle very large numbers without precision issues", () => {
    const data: DataPoint[] = [
      [1e9, 2e9],
      [2e9, 4e9],
      [3e9, 6e9],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(0);
    expect(result.r2).toBeCloseTo(1);
  });

  it("predict function should use raw x for calculation, not rounded input x", () => {
    const data: DataPoint[] = [
      [1, 2],
      [2, 3],
    ];
    const result = linear({ precision: 0 }, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    // y = 1x + 1, predict(1.5) → raw: 2.5 → round(2.5, 0) = 3
    expect(result.predict(1.5)[1]).toBe(3);
    expect(result.predict(0.4)[1]).toBe(1); // 1.4 → 1
    expect(result.predict(0.6)[1]).toBe(2); // 1.6 → 2
  });

  it("should have R² of 1 for a perfectly horizontal line where all y-values are identical", () => {
    const data: DataPoint[] = [
      [1, 5],
      [2, 5],
      [3, 5],
    ];
    const result = linear({}, data);

    if (!result.ok) {
      throw new Error("Expected successful regression result");
    }

    expect(result.slope).toBeCloseTo(0);
    expect(result.intercept).toBeCloseTo(5);
    expect(result.r2).toBeCloseTo(1);
    expect(result.rmse).toBeCloseTo(0);
  });

  it("rmse should be 0 for a perfect fit and positive for scattered data", () => {
    const perfectData: DataPoint[] = [[1, 2], [2, 4], [3, 6]];
    const perfectResult = linear({}, perfectData);
    if (!perfectResult.ok) throw new Error("Expected success");
    expect(perfectResult.rmse).toBe(0);

    const scatteredData: DataPoint[] = [[1, 1], [2, 3], [3, 2], [4, 5]];
    const scatteredResult = linear({}, scatteredData);
    if (!scatteredResult.ok) throw new Error("Expected success");
    expect(scatteredResult.rmse).toBeGreaterThan(0);
  });
});
