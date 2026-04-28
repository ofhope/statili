import type { DataPoint, PredictedPoint } from "./types";

/**
 * Round a number to a specified precision (number of decimal places).
 *
 * @param {number} number - The number to round.
 * @param {number} precision - The number of decimal places to round to.
 * @returns {number} - The rounded number.
 */
export function round(number: number, precision: number): number {
  if (precision === undefined || precision === null || !Number.isFinite(precision)) {
    return number;
  }
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}


/**
 * Determine the coefficient of determination (r^2) of a fit from the observations
 * and predictions.
 *
 * @param {DataPoint[]} data - Pairs of observed x-y values.
 * @param {PredictedPoint[]} results - Pairs of observed predicted x-y values.
 * @returns {number} - The r^2 value, or NaN if one cannot be calculated (e.g., no valid observations, or no variance in observed y).
 */
export function rSquared(data: DataPoint[], results: PredictedPoint[]): number {
  const observations: [number, number][] = [];
  const predictions: PredictedPoint[] = [];

  data.forEach((d, i) => {
    if (d[1] !== null) {
      observations.push([d[0], d[1] as number]);
      predictions.push(results[i]);
    }
  });

  if (observations.length === 0) {
    return NaN; // Cannot calculate r^2 with no valid observations
  }

  const sumY = observations.reduce((a, observation) => a + observation[1], 0);
  const meanY = sumY / observations.length;

  const ssyy = observations.reduce((a, observation) => {
    const difference = observation[1] - meanY;
    return a + (difference * difference);
  }, 0);

  const sse = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + (residual * residual);
  }, 0);

  // If ssyy is 0, it means all observed y values are the same.
  // In this case, if sse is also 0, it's a perfect fit (r^2 = 1).
  // Otherwise, if there are residuals but no variance in observed y, r^2 is undefined.
  if (ssyy === 0) {
    return sse === 0 ? 1 : NaN;
  }

  return 1 - (sse / ssyy);
}

export function isValid(value: number): boolean {
  return value !== null && !isNaN(value) && isFinite(value);
}

/**
 * Calculate the Root Mean Squared Error (RMSE) between observed and predicted values.
 * RMSE is expressed in the same units as the dependent variable (Y), making it directly
 * interpretable: a model with RMSE of 4.2 produces predictions within roughly ±4.2 units on average.
 *
 * @param {DataPoint[]} data - Pairs of observed [x, y] values.
 * @param {PredictedPoint[]} results - Pairs of predicted [x, y] values from the model.
 * @returns {number} The RMSE value, or NaN if it cannot be calculated (e.g., no valid observations).
 */
export function rmse(data: DataPoint[], results: PredictedPoint[]): number {
  const pairs: Array<[number, number]> = [];

  data.forEach((d, i) => {
    if (d[1] !== null && results[i] !== undefined) {
      pairs.push([d[1] as number, results[i][1]]);
    }
  });

  if (pairs.length === 0) return NaN;

  const sse = pairs.reduce((accum, [actual, predicted]) => {
    const residual = actual - predicted;
    return accum + residual * residual;
  }, 0);

  return Math.sqrt(sse / pairs.length);
}