import { curry } from "@statili/fp";
import { DEFAULT_OPTIONS } from "./const";
import type {
  DataPoint,
  PredictedPoint,
  RegressionOptions,
  RegressionResult,
} from "./types";
import { rSquared, rmse, round, isValid } from "./util";

/**
 * Performs simple linear regression to model the relationship between a dependent variable (y)
 * and an independent variable (x).
 *
 * Fits a straight line (y = slope·x + intercept) through the data by minimising the sum of
 * squared residuals between observed and predicted y values (Ordinary Least Squares).
 *
 * @param {Partial<RegressionOptions>} [suppliedOptions] - Optional overrides, e.g. `{ precision: 4 }`.
 * @param {DataPoint[]} data - Array of `[x, y]` tuples. Requires at least 2 points with distinct x values.
 * @returns {RegressionResult} Discriminant union:
 *   - `ok: true`  — includes `slope`, `intercept`, `r2`, `rmse`, `n`, `points`, `predict`.
 *   - `ok: false` — includes `errorType` and `message` describing why regression failed.
 *
 * @example
 * // Basic usage
 * const data: DataPoint[] = [[1, 2], [2, 3], [3, 4], [4, 5]];
 * const result = linear({}, data);
 * if (result.ok) {
 *   console.log(`slope: ${result.slope}`);       // 1
 *   console.log(`intercept: ${result.intercept}`); // 1
 *   console.log(`R²: ${result.r2}`);              // 1
 *   console.log(`RMSE: ${result.rmse}`);           // 0
 *   console.log(`n: ${result.n}`);                 // 4
 *   console.log(`predict(5): ${result.predict(5)[1]}`); // 6
 * }
 *
 * @example
 * // Curried / partial application (data-last for composability)
 * const regressionWithPrecision = linear({ precision: 4 });
 * const result = regressionWithPrecision(data);
 *
 * @example
 * // Handling errors
 * const vertical: DataPoint[] = [[1, 1], [1, 2], [1, 3]];
 * const err = linear({}, vertical);
 * // err.ok === false, err.errorType === "DegenerateInput"
 *
 * @description
 * **Insights derivable from the result (for use by @statili/forge):**
 * - **Trend direction** — `slope > 0` positive, `slope < 0` negative, `slope ≈ 0` flat.
 * - **Rate of change** — `slope` quantifies Y change per unit X.
 * - **Goodness of fit** — `r2` (0–1): higher = better fit.
 * - **Prediction accuracy** — `rmse` in Y-axis units; enables "predictions within ±X" statements.
 * - **Sample reliability** — `n` allows warnings for small sample sizes.
 * - **Future prediction** — `predict(x)` returns `[x, predictedY]` for any x.
 */
export const linear = curry((
  suppliedOptions: Partial<RegressionOptions>,
  data: DataPoint[]
): RegressionResult => {
  const options: RegressionOptions = {
    ...DEFAULT_OPTIONS,
    ...suppliedOptions,
  };

  if (data.length < 2) {
    return {
      ok: false,
      method: "linear",
      errorType: "InsufficientData",
      message: `Linear regression requires at least 2 data points. Received ${data.length}.`,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;
  let sumXY = 0;

  const len = data.length;

  for (let n = 0; n < len; n++) {
    const x = data[n][0];
    const y = data[n][1];
    if (!isValid(x) || !isValid(y)) {
      return {
        ok: false,
        method: "linear",
        errorType: "InvalidInput",
        message: `Data point at index ${n} contains non-finite values (${x}, ${y}). Linear regression requires finite numerical inputs.`,
      };
    }
    sumX += x;
    sumY += y;
    sumX2 += x * x;
    sumXY += x * y;
  }

  const run = len * sumX2 - sumX * sumX;
  const rise = len * sumXY - sumX * sumY;

  if (run === 0) {
    return {
      ok: false,
      method: "linear",
      errorType: "DegenerateInput",
      message:
        "Cannot perform linear regression: all x-values are identical, resulting in a vertical line. " +
        "Linear regression requires variation in the independent variable (X).",
    };
  }

  const slope = round(rise / run, options.precision);
  const intercept = round(
    sumY / len - (slope * sumX) / len,
    options.precision
  );

  if (
    isNaN(slope) ||
    !isFinite(slope) ||
    isNaN(intercept) ||
    !isFinite(intercept)
  ) {
    return {
      ok: false,
      method: "linear",
      errorType: "MathError",
      message:
        "Linear regression produced non-finite coefficients (NaN or Infinity). " +
        "This can occur with extremely large values or other numerical edge cases.",
    };
  }

  const predict = (x: number): PredictedPoint => [
    round(x, options.precision),
    round(slope * x + intercept, options.precision),
  ];

  const points = data.map((point) => predict(point[0]));

  const r2 = rSquared(data, points);

  if (isNaN(r2)) {
    return {
      ok: false,
      method: "linear",
      errorType: "MathError",
      message:
        "R² calculation failed. This can occur if all y-values are identical (zero variance in Y) " +
        "or due to other numerical issues.",
    };
  }

  const calculatedRmse = rmse(data, points);

  return {
    ok: true,
    method: "linear",
    slope,
    intercept,
    r2: round(r2, options.precision),
    rmse: round(calculatedRmse, options.precision),
    n: len,
    points,
    predict,
  };
});
