import type { DataPoint, PredictedPoint } from "./types";
import { round as _round, isFiniteNumber, gaussianElimination } from "@statili/math";

// Re-export math primitives so existing internal callers within @statili/stats
// that import from "./util" continue to work without changes.
export { isFiniteNumber as isValid, gaussianElimination };

/**
 * Rounds a number to `precision` decimal places.
 * Thin wrapper over `@statili/math`'s `round` that restores the original
 * two-argument order `(value, precision)` used throughout this package.
 */
export function round(number: number, precision: number): number {
  return _round(precision, number);
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
