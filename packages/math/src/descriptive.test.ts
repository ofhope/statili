import { describe, it, expect } from 'vitest';
import {
  sum,
  mean,
  median,
  variance,
  standardDeviation,
  min,
  max,
  range,
  quantile,
  mad,
  covariance,
  pearsonCorrelation,
} from './descriptive';

// ─── sum ─────────────────────────────────────────────────────────────────────

describe('sum', () => {
  it('returns 0 for an empty array', () => {
    expect(sum([])).toBe(0);
  });

  it('sums positive integers', () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  it('sums negative numbers', () => {
    expect(sum([-1, -2, -3])).toBe(-6);
  });

  it('sums a mix of positive and negative', () => {
    expect(sum([-5, 5, -10, 10])).toBe(0);
  });

  it('handles a single element', () => {
    expect(sum([42])).toBe(42);
  });

  it('handles floating-point values', () => {
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });

  it('handles large values without overflow', () => {
    expect(sum([1e15, 2e15, 3e15])).toBe(6e15);
  });
});

// ─── mean ────────────────────────────────────────────────────────────────────

describe('mean', () => {
  it('returns NaN for an empty array', () => {
    expect(mean([])).toBeNaN();
  });

  it('returns the single element for a one-item array', () => {
    expect(mean([7])).toBe(7);
  });

  it('computes a basic mean', () => {
    expect(mean([2, 4, 6])).toBe(4);
  });

  it('handles negative values', () => {
    expect(mean([-3, -1, 1, 3])).toBe(0);
  });

  it('handles floats', () => {
    expect(mean([1.5, 2.5])).toBeCloseTo(2);
  });

  it('matches known R/Python result for skewed data', () => {
    // R: mean(c(1,2,3,4,100)) = 22
    expect(mean([1, 2, 3, 4, 100])).toBe(22);
  });
});

// ─── median ──────────────────────────────────────────────────────────────────

describe('median', () => {
  it('returns NaN for an empty array', () => {
    expect(median([])).toBeNaN();
  });

  it('returns the single element for a one-item array', () => {
    expect(median([5])).toBe(5);
  });

  it('returns the middle element for an odd-length array', () => {
    // unsorted input
    expect(median([3, 1, 4, 1, 5])).toBe(3);
  });

  it('returns the average of the two middle elements for even length', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('handles negative numbers', () => {
    expect(median([-3, -1, -2])).toBe(-2);
  });

  it('does not mutate the original array', () => {
    const data = [5, 3, 1, 4, 2];
    median(data);
    expect(data).toEqual([5, 3, 1, 4, 2]);
  });

  it('returns the value itself for all-equal arrays', () => {
    expect(median([7, 7, 7, 7])).toBe(7);
  });
});

// ─── variance ────────────────────────────────────────────────────────────────

describe('variance', () => {
  it('returns NaN for an empty array', () => {
    expect(variance([])).toBeNaN();
  });

  it('returns NaN for a single-element array (sample, ddof=1)', () => {
    expect(variance([5])).toBeNaN();
  });

  it('returns 0 for a single-element array with ddof=0', () => {
    expect(variance([5], 0)).toBe(0);
  });

  it('computes sample variance (ddof=1)', () => {
    // R: var(c(2,4,4,4,5,5,7,9)) = 4.571428...
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4.5714, 4);
  });

  it('computes population variance (ddof=0)', () => {
    // population: sum-of-sq / 8 = 4
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9], 0)).toBeCloseTo(4, 10);
  });

  it('returns 0 when all values are identical', () => {
    expect(variance([3, 3, 3, 3])).toBe(0);
  });

  it('handles negative values', () => {
    expect(variance([-2, -1, 0, 1, 2])).toBeCloseTo(2.5, 10);
  });
});

// ─── standardDeviation ───────────────────────────────────────────────────────

describe('standardDeviation', () => {
  it('returns NaN for an empty array', () => {
    expect(standardDeviation([])).toBeNaN();
  });

  it('returns NaN for a single-element sample', () => {
    expect(standardDeviation([42])).toBeNaN();
  });

  it('computes sample std dev', () => {
    // R: sd(c(2,4,4,4,5,5,7,9)) ≈ 2.1381...
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.1381, 4);
  });

  it('computes population std dev (ddof=0)', () => {
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9], 0)).toBeCloseTo(2, 10);
  });

  it('equals sqrt of variance', () => {
    const data = [3, 7, 7, 19];
    expect(standardDeviation(data)).toBeCloseTo(Math.sqrt(variance(data)), 10);
  });

  it('returns 0 for constant data', () => {
    expect(standardDeviation([5, 5, 5, 5], 0)).toBe(0);
  });
});

// ─── min / max ───────────────────────────────────────────────────────────────

describe('min', () => {
  it('returns NaN for an empty array', () => {
    expect(min([])).toBeNaN();
  });

  it('finds the minimum', () => {
    expect(min([3, 1, 4, 1, 5, 9, 2, 6])).toBe(1);
  });

  it('works with a single element', () => {
    expect(min([7])).toBe(7);
  });

  it('handles negative numbers', () => {
    expect(min([-10, -3, -1])).toBe(-10);
  });
});

describe('max', () => {
  it('returns NaN for an empty array', () => {
    expect(max([])).toBeNaN();
  });

  it('finds the maximum', () => {
    expect(max([3, 1, 4, 1, 5, 9, 2, 6])).toBe(9);
  });

  it('works with a single element', () => {
    expect(max([7])).toBe(7);
  });

  it('handles negative numbers', () => {
    expect(max([-10, -3, -1])).toBe(-1);
  });
});

// ─── range ───────────────────────────────────────────────────────────────────

describe('range', () => {
  it('returns NaN for an empty array', () => {
    expect(range([])).toBeNaN();
  });

  it('computes max − min', () => {
    expect(range([3, 1, 4, 1, 5, 9])).toBe(8);
  });

  it('returns 0 for a single element', () => {
    expect(range([7])).toBe(0);
  });

  it('returns 0 for a constant array', () => {
    expect(range([4, 4, 4])).toBe(0);
  });
});

// ─── quantile ────────────────────────────────────────────────────────────────

describe('quantile', () => {
  it('returns NaN for an empty array', () => {
    expect(quantile(0.5, [])).toBeNaN();
  });

  it('throws a RangeError for p < 0', () => {
    expect(() => quantile(-0.1, [1, 2, 3])).toThrow(RangeError);
  });

  it('throws a RangeError for p > 1', () => {
    expect(() => quantile(1.1, [1, 2, 3])).toThrow(RangeError);
  });

  it('p=0 returns the minimum', () => {
    expect(quantile(0, [5, 3, 1, 4, 2])).toBe(1);
  });

  it('p=1 returns the maximum', () => {
    expect(quantile(1, [5, 3, 1, 4, 2])).toBe(5);
  });

  it('p=0.5 returns the median', () => {
    expect(quantile(0.5, [1, 2, 3, 4, 5])).toBe(3);
  });

  it('matches R quantile(type=7) for Q1', () => {
    // R: quantile(c(1,2,3,4), 0.25) = 1.75
    expect(quantile(0.25, [1, 2, 3, 4])).toBeCloseTo(1.75, 10);
  });

  it('matches R quantile(type=7) for Q3', () => {
    // R: quantile(c(1,2,3,4), 0.75) = 3.25
    expect(quantile(0.75, [1, 2, 3, 4])).toBeCloseTo(3.25, 10);
  });

  it('supports partial application pattern for IQR', () => {
    const q1 = (data: number[]) => quantile(0.25, data);
    const q3 = (data: number[]) => quantile(0.75, data);
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    // Q1 = 2.75, Q3 = 6.25 → IQR = 3.5  (R type-7 linear interpolation)
    expect(q3(data) - q1(data)).toBeCloseTo(3.5, 10);
  });

  it('does not mutate the input array', () => {
    const data = [5, 3, 1, 4, 2];
    quantile(0.5, data);
    expect(data).toEqual([5, 3, 1, 4, 2]);
  });
});

// ─── mad ─────────────────────────────────────────────────────────────────────

describe('mad', () => {
  it('returns NaN for an empty array', () => {
    expect(mad([])).toBeNaN();
  });

  it('computes the median absolute deviation', () => {
    // R: mad(c(1,1,2,2,4,6,9), constant=1) = 1
    expect(mad([1, 1, 2, 2, 4, 6, 9])).toBe(1);
  });

  it('returns 0 for a constant array', () => {
    expect(mad([5, 5, 5, 5])).toBe(0);
  });

  it('is robust to extreme outliers (unlike stdDev)', () => {
    const normal = [1, 2, 3, 4, 5];
    const withOutlier = [1, 2, 3, 4, 1000];
    // MAD should barely change
    expect(Math.abs(mad(withOutlier) - mad(normal))).toBeLessThan(2);
    // stdDev explodes
    expect(standardDeviation(withOutlier)).toBeGreaterThan(100);
  });
});

// ─── covariance ──────────────────────────────────────────────────────────────

describe('covariance', () => {
  it('returns NaN for empty arrays', () => {
    expect(covariance([], [])).toBeNaN();
  });

  it('returns NaN when arrays have different lengths', () => {
    expect(covariance([1, 2], [1, 2, 3])).toBeNaN();
  });

  it('returns NaN for single-element arrays', () => {
    expect(covariance([1], [1])).toBeNaN();
  });

  it('returns positive covariance for a positive relationship', () => {
    // R: cov(c(1,2,3), c(4,5,6)) = 1
    expect(covariance([1, 2, 3], [4, 5, 6])).toBeCloseTo(1, 10);
  });

  it('returns negative covariance for a negative relationship', () => {
    // R: cov(c(1,2,3), c(6,5,4)) = -1
    expect(covariance([1, 2, 3], [6, 5, 4])).toBeCloseTo(-1, 10);
  });

  it('returns 0 for uncorrelated data', () => {
    expect(covariance([1, 2, 3], [3, 3, 3])).toBeCloseTo(0, 10);
  });

  it('is symmetric: cov(x,y) === cov(y,x)', () => {
    const xs = [1, 3, 5, 7];
    const ys = [2, 8, 3, 9];
    expect(covariance(xs, ys)).toBeCloseTo(covariance(ys, xs), 10);
  });
});

// ─── pearsonCorrelation ───────────────────────────────────────────────────────

describe('pearsonCorrelation', () => {
  it('returns NaN for empty arrays', () => {
    expect(pearsonCorrelation([], [])).toBeNaN();
  });

  it('returns NaN for mismatched lengths', () => {
    expect(pearsonCorrelation([1, 2], [1, 2, 3])).toBeNaN();
  });

  it('returns NaN when xs has zero variance', () => {
    expect(pearsonCorrelation([3, 3, 3], [1, 2, 3])).toBeNaN();
  });

  it('returns NaN when ys has zero variance', () => {
    expect(pearsonCorrelation([1, 2, 3], [5, 5, 5])).toBeNaN();
  });

  it('returns 1 for a perfect positive linear relationship', () => {
    expect(pearsonCorrelation([1, 2, 3], [4, 5, 6])).toBeCloseTo(1, 10);
  });

  it('returns -1 for a perfect negative linear relationship', () => {
    expect(pearsonCorrelation([1, 2, 3], [6, 5, 4])).toBeCloseTo(-1, 10);
  });

  it('is bounded in [-1, 1]', () => {
    const xs = [1, 5, 3, 8, 2, 9];
    const ys = [4, 2, 7, 1, 6, 3];
    const r = pearsonCorrelation(xs, ys);
    expect(r).toBeGreaterThanOrEqual(-1);
    expect(r).toBeLessThanOrEqual(1);
  });

  it('is symmetric: r(x,y) === r(y,x)', () => {
    const xs = [2, 4, 5, 4, 5];
    const ys = [4, 4, 5, 5, 5];
    expect(pearsonCorrelation(xs, ys)).toBeCloseTo(pearsonCorrelation(ys, xs), 10);
  });

  it('matches known R result', () => {
    // R: cor(c(1,2,3,4,5), c(2,4,5,4,5)) ≈ 0.7746
    // cov = 1.5, sd_x = sqrt(2.5), sd_y = sqrt(1.5) → r = 1.5 / sqrt(2.5 * 1.5) ≈ 0.7746
    const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
    expect(r).toBeCloseTo(0.7746, 4);
  });

  it('r² equals R² from a perfect linear fit', () => {
    const xs = [1, 2, 3, 4, 5];
    const ys = [2, 4, 6, 8, 10];
    const r = pearsonCorrelation(xs, ys);
    expect(r * r).toBeCloseTo(1, 10);
  });
});
