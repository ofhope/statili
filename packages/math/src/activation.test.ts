import { describe, it, expect } from 'vitest';
import { sigmoid } from './activation';

describe('sigmoid', () => {
  it('returns exactly 0.5 at z=0', () => {
    expect(sigmoid(0)).toBe(0.5);
  });

  it('returns a value > 0.5 for positive z', () => {
    expect(sigmoid(1)).toBeGreaterThan(0.5);
    expect(sigmoid(5)).toBeGreaterThan(0.5);
  });

  it('returns a value < 0.5 for negative z', () => {
    expect(sigmoid(-1)).toBeLessThan(0.5);
    expect(sigmoid(-5)).toBeLessThan(0.5);
  });

  it('output is always in the open interval (0, 1) for moderate z', () => {
    // For |z| <= 36 JavaScript floats remain strictly inside (0, 1).
    // Beyond that, IEEE 754 double precision saturates to 0 or 1 exactly,
    // which is numerically expected (the mathematical property still holds).
    for (const z of [-36, -10, -1, 0, 1, 10, 36]) {
      const s = sigmoid(z);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    }
  });

  it('is symmetric: sigmoid(-z) === 1 - sigmoid(z)', () => {
    for (const z of [0.5, 1, 2, 5, 10]) {
      expect(sigmoid(-z)).toBeCloseTo(1 - sigmoid(z), 12);
    }
  });

  it('matches known values at z=2 (≈ 0.8808)', () => {
    expect(sigmoid(2)).toBeCloseTo(0.8808, 4);
  });

  it('matches known values at z=-2 (≈ 0.1192)', () => {
    expect(sigmoid(-2)).toBeCloseTo(0.1192, 4);
  });

  it('saturates to ≈ 1 for very large z (numerical stability)', () => {
    expect(sigmoid(1000)).toBeCloseTo(1, 10);
  });

  it('saturates to ≈ 0 for very small z (numerical stability)', () => {
    expect(sigmoid(-1000)).toBeCloseTo(0, 10);
  });

  it('satisfies the gradient identity: σ(z)·(1−σ(z))', () => {
    // Gradient of sigmoid equals σ(z) * (1 - σ(z))
    for (const z of [-2, -1, 0, 1, 2]) {
      const s = sigmoid(z);
      const gradient = s * (1 - s);
      // Numerical derivative
      const eps = 1e-6;
      const numericalGrad = (sigmoid(z + eps) - sigmoid(z - eps)) / (2 * eps);
      expect(gradient).toBeCloseTo(numericalGrad, 5);
    }
  });
});
