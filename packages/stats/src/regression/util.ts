import type { DataPoint, PredictedPoint } from "./types";

export function round(number: number, precision: number): number {
  if (precision === undefined || precision === null || !Number.isFinite(precision)) return number;
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

export function isValid(value: number): boolean {
  return value !== null && !isNaN(value) && isFinite(value);
}

export function rSquared(data: DataPoint[], results: PredictedPoint[]): number {
  const obs: [number, number][] = [];
  const pred: PredictedPoint[] = [];
  data.forEach((d, i) => {
    if (d[1] !== null) { obs.push([d[0], d[1] as number]); pred.push(results[i]); }
  });
  if (obs.length === 0) return NaN;
  const meanY = obs.reduce((a, o) => a + o[1], 0) / obs.length;
  const ssyy  = obs.reduce((a, o) => a + (o[1] - meanY) ** 2, 0);
  const sse   = obs.reduce((acc, o, i) => acc + (o[1] - pred[i][1]) ** 2, 0);
  if (ssyy === 0) return sse === 0 ? 1 : NaN;
  return 1 - sse / ssyy;
}

export function rmse(data: DataPoint[], results: PredictedPoint[]): number {
  const pairs: [number, number][] = [];
  data.forEach((d, i) => {
    if (d[1] !== null && results[i] !== undefined) pairs.push([d[1] as number, results[i][1]]);
  });
  if (pairs.length === 0) return NaN;
  const sse = pairs.reduce((acc, [a, p]) => acc + (a - p) ** 2, 0);
  return Math.sqrt(sse / pairs.length);
}

/** R2 from parallel actual/predicted Y arrays. Used by multilinear and logistic. */
export function rSquaredFromYValues(actualY: number[], predictedY: number[]): number {
  const n = actualY.length;
  if (n === 0) return NaN;
  const meanY = actualY.reduce((s, y) => s + y, 0) / n;
  const ssyy  = actualY.reduce((s, y) => s + (y - meanY) ** 2, 0);
  const sse   = actualY.reduce((s, y, i) => s + (y - predictedY[i]) ** 2, 0);
  if (ssyy === 0) return sse === 0 ? 1 : NaN;
  return 1 - sse / ssyy;
}

/** RMSE from parallel actual/predicted Y arrays. */
export function rmseFromYValues(actualY: number[], predictedY: number[]): number {
  const n = actualY.length;
  if (n === 0) return NaN;
  const sse = actualY.reduce((s, y, i) => s + (y - predictedY[i]) ** 2, 0);
  return Math.sqrt(sse / n);
}

/**
 * Solves Ax=b via Gaussian elimination with partial pivoting.
 * @param input  Augmented matrix [A|b] in row-major form (n rows x n+1 cols).
 * @param order  Number of unknowns (= number of rows).
 * @returns Solution vector, or array of NaN if singular.
 */
export function gaussianElimination(input: number[][], order: number): number[] {
  const matrix = input.map(row => [...row]);
  const n = matrix.length;
  const coefficients: number[] = new Array(order);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) maxRow = j;
    }
    [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

    for (let j = i + 1; j < n; j++) {
      if (matrix[i][i] === 0) return new Array(order).fill(NaN);
      const factor = matrix[j][i] / matrix[i][i];
      for (let k = i; k <= n; k++) matrix[j][k] -= factor * matrix[i][k];
    }
  }

  for (let j = n - 1; j >= 0; j--) {
    if (matrix[j][j] === 0) return new Array(order).fill(NaN);
    let total = 0;
    for (let k = j + 1; k < n; k++) total += matrix[j][k] * coefficients[k];
    coefficients[j] = (matrix[j][n] - total) / matrix[j][j];
  }

  return coefficients;
}
