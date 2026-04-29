/**
 * Solves the linear system **Ax = b** via **Gaussian elimination with partial
 * pivoting**.
 *
 * The augmented matrix `[A | b]` is passed as `input`: an `n × (n+1)` matrix
 * where the first `n` columns represent `A` and the last column represents
 * `b`. The function operates on a deep copy and does **not** mutate its input.
 *
 * **Partial pivoting** (swapping rows so the largest absolute value in the
 * current column is the pivot) reduces numerical instability caused by small
 * pivots.
 *
 * Returns an array of `NaN` values if the system is singular (i.e. `A` has
 * no unique solution).
 *
 * @param input - Augmented matrix `[A | b]` in row-major form: `n` rows, each
 *   with `n + 1` elements. The caller is responsible for passing a
 *   well-formed matrix.
 * @param order - Number of unknowns `n` (equals the number of rows).
 * @returns Solution vector `x` of length `order`, or `Array(order).fill(NaN)`
 *   if the matrix is singular.
 *
 * @throws {Error} If `input` is not a rectangular array with the expected
 *   dimensions. (Runtime invariant — intended for developer debugging.)
 *
 * @example
 * // Solve: 2x + y = 5, x + 3y = 10  → x ≈ 1, y ≈ 3
 * gaussianElimination([[2, 1, 5], [1, 3, 10]], 2)  // [1, 3]
 *
 * // Singular system — no unique solution
 * gaussianElimination([[1, 2, 3], [2, 4, 6]], 2)   // [NaN, NaN]
 *
 * @description
 * **Usage in `@statili/stats`** — polynomial and multilinear regression both
 * construct a normal-equations matrix (`XᵀX | Xᵀy`) and call
 * `gaussianElimination` to recover the coefficient vector. This function is
 * also called internally by logistic regression for weight initialisation
 * helpers.
 */
export function gaussianElimination(input: number[][], order: number): number[] {
  const matrix = input.map(row => [...row]);
  const n = matrix.length;
  const coefficients: number[] = new Array(order);

  for (let i = 0; i < n; i++) {
    // Partial pivoting: find the row with the largest absolute pivot value
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) maxRow = j;
    }
    [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

    // Forward elimination
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][i] === 0) return new Array(order).fill(NaN);
      const factor = matrix[j][i] / matrix[i][i];
      for (let k = i; k <= n; k++) matrix[j][k] -= factor * matrix[i][k];
    }
  }

  // Back substitution
  for (let j = n - 1; j >= 0; j--) {
    if (matrix[j][j] === 0) return new Array(order).fill(NaN);
    let total = 0;
    for (let k = j + 1; k < n; k++) total += matrix[j][k] * coefficients[k];
    coefficients[j] = (matrix[j][n] - total) / matrix[j][j];
  }

  return coefficients;
}
