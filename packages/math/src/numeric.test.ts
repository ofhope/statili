import { describe, it, expect } from 'vitest';
import { round, isFiniteNumber, clamp, lerp } from './numeric';

// ─── round ───────────────────────────────────────────────────────────────────

describe('round', () => {
  it('rounds to 2 decimal places', () => {
    expect(round(2, 1.2345)).toBe(1.23);
  });

  it('rounds up correctly', () => {
    expect(round(2, 1.2355)).toBe(1.24);
  });

  it('rounds to 0 decimal places (integer)', () => {
    expect(round(0, 3.7)).toBe(4);
    expect(round(0, 3.2)).toBe(3);
  });

  it('handles negative precision gracefully — returns value unchanged', () => {
    // NaN precision → passthrough
    expect(round(NaN, 1.5)).toBe(1.5);
  });

  it('returns the value unchanged for non-finite precision', () => {
    expect(round(Infinity, 3.14)).toBe(3.14);
  });

  it('handles precision=4', () => {
    expect(round(4, Math.PI)).toBeCloseTo(3.1416, 4);
  });

  it('supports partial application', () => {
    const toCents = (v: number) => round(2, v);
    expect(toCents(19.999)).toBe(20);
    expect(toCents(0.001)).toBe(0);
  });
});

// ─── isFiniteNumber ───────────────────────────────────────────────────────────

describe('isFiniteNumber', () => {
  it('returns true for normal integers', () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(42)).toBe(true);
    expect(isFiniteNumber(-7)).toBe(true);
  });

  it('returns true for floats', () => {
    expect(isFiniteNumber(3.14)).toBe(true);
    expect(isFiniteNumber(-0.001)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isFiniteNumber(NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isFiniteNumber(Infinity)).toBe(false);
  });

  it('returns false for -Infinity', () => {
    expect(isFiniteNumber(-Infinity)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isFiniteNumber(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isFiniteNumber(undefined)).toBe(false);
  });

  it('returns false for strings', () => {
    expect(isFiniteNumber('42')).toBe(false);
  });
});

// ─── clamp ───────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('returns lo when value is below range', () => {
    expect(clamp(0, 1, -0.5)).toBe(0);
  });

  it('returns hi when value is above range', () => {
    expect(clamp(0, 1, 1.5)).toBe(1);
  });

  it('returns value when within range', () => {
    expect(clamp(0, 1, 0.5)).toBe(0.5);
  });

  it('returns lo when value exactly equals lo', () => {
    expect(clamp(0, 10, 0)).toBe(0);
  });

  it('returns hi when value exactly equals hi', () => {
    expect(clamp(0, 10, 10)).toBe(10);
  });

  it('works with negative ranges', () => {
    expect(clamp(-10, -1, -5)).toBe(-5);
    expect(clamp(-10, -1, -20)).toBe(-10);
    expect(clamp(-10, -1, 0)).toBe(-1);
  });
});

// ─── lerp ────────────────────────────────────────────────────────────────────

describe('lerp', () => {
  it('returns a at t=0', () => {
    expect(lerp(2, 10, 0)).toBe(2);
  });

  it('returns b at t=1', () => {
    expect(lerp(2, 10, 1)).toBe(10);
  });

  it('returns the midpoint at t=0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('interpolates correctly at t=0.25', () => {
    expect(lerp(2, 8, 0.25)).toBeCloseTo(3.5, 10);
  });

  it('extrapolates beyond endpoints for t > 1', () => {
    expect(lerp(0, 100, 1.1)).toBeCloseTo(110, 10);
  });

  it('extrapolates beyond endpoints for t < 0', () => {
    expect(lerp(0, 100, -0.1)).toBeCloseTo(-10, 10);
  });

  it('works when a === b', () => {
    expect(lerp(5, 5, 0.7)).toBe(5);
  });
});
