import { curry } from "@statili/fp";
import { DEFAULT_OPTIONS } from "./const";
import type { DataPoint, PredictedPoint, RegressionOptions, RegressionResult } from "./types";
import { isValid, rmse, round, rSquared } from "./util";

/**
 * Performs power law regression to model the relationship **y = a · xᵇ**.
 *
 * The model is linearised by taking logarithms of both sides:
 * `ln(y) = ln(a) + b·ln(x)`, which becomes a simple linear regression in
 * log-log space. The result is then transformed back to the original scale.
 *
 * **Domain constraints:** both x and y must be strictly positive (`> 0`).
 * Points violating this constraint are silently excluded from the fit.
 *
 * @param suppliedOptions - Optional `{ precision }` overrides.
 * @param data - Array of `[x, y]` tuples (requires x > 0, y > 0).
 * @returns Discriminant union:
 *   - `ok: true`  — includes `slope` (exponent b), `intercept` (scale a),
 *                   `r2`, `rmse`, `n`, `equation`, `predict`.
 *   - `ok: false` — includes `errorType` and `message`.
 *
 * @example
 * // Square-root growth: y ≈ 4√x
 * const data: DataPoint[] = [[1,4],[4,8],[9,12],[16,16],[25,20]];
 * const result = power({}, data);
 * if (result.ok) {
 *   console.log(result.equation);      // "y = 4x^0.5"
 *   console.log(result.slope);         // ≈ 0.5  (exponent b)
 *   console.log(result.intercept);     // ≈ 4    (scale a)
 *   console.log(result.predict(36)[1]); // ≈ 24
 * }
 *
 * @example
 * // Curried / partial application (data-last)
 * const fitPower = power({ precision: 4 });
 * const result = fitPower(data);
 *
 * @description
 * **Insights derivable from the result (for use by @statili/forge):**
 * - **Growth regime** — `slope` (exponent b) controls the growth pattern:
 *   - `b > 1`: super-linear / accelerating (economies of scale, network effects).
 *   - `0 < b < 1`: sub-linear / diminishing returns (square-root laws).
 *   - `b ≈ 1`: approximately proportional to X (linear relationship).
 *   - `b < 0`: inverse — Y decreases as X increases.
 * - **Doubling effect** — when X doubles, Y is multiplied by `2^b`.
 * - **Goodness of fit** — `r2` and `rmse`.
 * - **Scale** — `intercept` (a) is the predicted Y when X = 1.
 */
export const power = curry((
  suppliedOptions: Partial<RegressionOptions>,
  data: DataPoint[],
): RegressionResult => {
  const options: RegressionOptions = { ...DEFAULT_OPTIONS, ...suppliedOptions };

  for (let i = 0; i < data.length; i++) {
    const [x, y] = data[i];
    if (!isValid(x) || (y !== null && !isValid(y as number))) {
      return {
        ok: false,
        method: "power",
        errorType: "InvalidInput",
        message: `Data point at index ${i} contains a non-finite value ([${x}, ${y}]). ` +
          `Power law regression requires finite numerical inputs.`,
      };
    }
  }

  // Both x > 0 and y > 0 are required for the log-log linearisation
  const filteredData = data.filter(
    ([x, y]) => y !== null && (x as number) > 0 && (y as number) > 0
  ) as [number, number][];

  const n = filteredData.length;

  if (n < 2) {
    return {
      ok: false,
      method: "power",
      errorType: "InsufficientData",
      message: `Power law regression requires at least 2 valid data points with x > 0 and y > 0. ` +
        `Received ${n} qualifying points (points with x ≤ 0 or y ≤ 0 are excluded because ` +
        `logarithms are undefined for non-positive values).`,
    };
  }

  // Accumulate sums in log-log space: ln(y) = ln(a) + b·ln(x)
  let sumLnX = 0, sumLnY = 0, sumLnXLnY = 0, sumLnX2 = 0;

  for (const [x, y] of filteredData) {
    const lx = Math.log(x);
    const ly = Math.log(y);
    sumLnX   += lx;
    sumLnY   += ly;
    sumLnXLnY += lx * ly;
    sumLnX2  += lx * lx;
  }

  const denominator = n * sumLnX2 - sumLnX ** 2;

  if (denominator === 0) {
    return {
      ok: false,
      method: "power",
      errorType: "DegenerateInput",
      message: "Cannot compute power law regression: all x-values are identical in log-space, " +
        "meaning all x values are the same. Power law regression requires variation in x.",
    };
  }

  const b    = (n * sumLnXLnY - sumLnX * sumLnY) / denominator;
  const lnA  = (sumLnY - b * sumLnX) / n;
  const a    = Math.exp(lnA);

  if (!isFinite(a) || isNaN(a) || !isFinite(b) || isNaN(b)) {
    return {
      ok: false,
      method: "power",
      errorType: "MathError",
      message: "Power law regression produced non-finite coefficients. " +
        "This can occur with extreme y-value ratios or data that spans many orders of magnitude.",
    };
  }

  const coeffA = round(a, options.precision);
  const coeffB = round(b, options.precision);

  const predict = (x: number): PredictedPoint => [
    round(x, options.precision),
    round(coeffA * x ** coeffB, options.precision),
  ];

  const points = data.map(([x]) => predict(x));
  const r2 = rSquared(data, points);

  return {
    ok: true,
    method: "power",
    slope: coeffB,      // The exponent b
    intercept: coeffA,  // The scale coefficient a (= predicted Y when X = 1)
    r2: round(r2, options.precision),
    rmse: round(rmse(data, points), options.precision),
    n,
    points,
    predict,
    equation: `y = ${coeffA}x^${coeffB}`,
  };
});
