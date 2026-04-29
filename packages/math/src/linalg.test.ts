import { describe, it, expect } from 'vitest';
import { gaussianElimination } from './linalg';

describe('gaussianElimination', () => {
  it('solves a 2×2 system', () => {
    // 2x + y = 5
    //  x + 3y = 10  →  x=1, y=3
    const result = gaussianElimination([[2, 1, 5], [1, 3, 10]], 2);
    expect(result[0]).toBeCloseTo(1, 10);
    expect(result[1]).toBeCloseTo(3, 10);
  });

  it('solves a 3×3 system', () => {
    // x + y + z = 6
    // 2y + 5z = -4
    // 2x + 5y - z = 27  →  x=5, y=3, z=-2
    const result = gaussianElimination(
      [
        [1, 1, 1, 6],
        [0, 2, 5, -4],
        [2, 5, -1, 27],
      ],
      3,
    );
    expect(result[0]).toBeCloseTo(5, 10);
    expect(result[1]).toBeCloseTo(3, 10);
    expect(result[2]).toBeCloseTo(-2, 10);
  });

  it('returns NaN array for a singular matrix (no unique solution)', () => {
    // Rows are linearly dependent
    const result = gaussianElimination([[1, 2, 3], [2, 4, 6]], 2);
    expect(result.every(isNaN)).toBe(true);
  });

  it('handles a 1×1 system', () => {
    // 3x = 9  →  x=3
    const result = gaussianElimination([[3, 9]], 1);
    expect(result[0]).toBeCloseTo(3, 10);
  });

  it('does not mutate the input matrix', () => {
    const input = [[2, 1, 5], [1, 3, 10]];
    const copy = input.map(row => [...row]);
    gaussianElimination(input, 2);
    expect(input).toEqual(copy);
  });

  it('solves an ill-conditioned system (partial pivoting stabilises it)', () => {
    // System: 0.001x + 2y = 2.001
    //            x − 2y = −1
    // Exact solution: x = 1, y = 1
    // Without partial pivoting a naive implementation divides by the tiny pivot
    // 0.001, amplifying rounding error. Pivoting swaps to use row 2 first.
    const result = gaussianElimination(
      [
        [0.001,  2, 2.001],
        [1,    -2, -1    ],
      ],
      2,
    );
    expect(result[0]).toBeCloseTo(1, 6);
    expect(result[1]).toBeCloseTo(1, 6);
  });

  it('matches known polynomial regression normal equations', () => {
    // Quadratic y = x²: normal equations for [[1,1],[2,4],[3,9]]
    // A = [[3, 6, 14], [6, 14, 36], [14, 36, 98]] (XᵀX)
    // b = [14, 36, 98] (Xᵀy) augmented:
    const augmented = [
      [3,  6,  14,  14],
      [6,  14, 36,  36],
      [14, 36, 98,  98],
    ];
    const coeffs = gaussianElimination(augmented, 3);
    // c0 (intercept) ≈ 0, c1 (linear) ≈ 0, c2 (quadratic) ≈ 1
    expect(coeffs[2]).toBeCloseTo(1, 4);
  });
});
