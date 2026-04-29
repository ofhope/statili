import { curry } from "@statili/fp";
import { DEFAULT_OPTIONS } from "./const";
import type { DataPoint, PredictedPoint, RegressionOptions, RegressionResult } from "./types";
import { isValid, rmse, round, rSquared } from "./util";

/**
 * Performs logarithmic regression to model the relationship **y = a + b · ln(x)**.
 *
 * The model captures scenarios where Y grows (or decays) rapidly at first then
 * progressively levels off as X increases — the classic **diminishing-returns** pattern.
 *
 * **Domain constraint:** x must be strictly positive (`> 0`).  Points with x ≤ 0
 * are silently excluded because `ln(x)` is undefined for non-positive values.
 *
 * @param suppliedOptions - Optional `{ precision }` overrides.
 * @param data - Array of `[x, y]` tuples (requires x > 0).
 * @returns Discriminant union:
 *   - `ok: true`  — includes `slope` (b — coefficient of ln x), `intercept` (a),
 *                   `r2`, `rmse`, `n`, `equation`, `predict`.
 *   - `ok: false` — includes `errorType` and `message`.
 *
 * @example
 * // Diminishing-returns growth: y ≈ 5·ln(x)
 * const data: DataPoint[] = [[1,0],[2,3.5],[4,6.9],[8,10.4],[16,13.9],[32,17.3]];
 * const result = logarithmic({}, data);
 * if (result.ok) {
 *   console.log(result.equation);       // "y = 0 + 5·ln(x)"
 *   console.log(result.slope);          // ≈ 5    (b — rate of log growth)
 *   console.log(result.intercept);      // ≈ 0    (a — y when x = 1)
 *   console.log(result.predict(64)[1]); // ≈ 20.7
 * }
 *
 * @example
 * // Curried / partial application (data-last)
 * const fitLog = logarithmic({ precision: 3 });
 * const result = fitLog(data);
 *
 * @description
 * **Insights derivable from the result (for use by @statili/forge):**
 * - **Growth direction** — `slope` (b): positive → Y grows and levels off;
 *   negative → Y decays and levels off.
 * - **Rate of change at X = 1** — equals `slope / 1 = slope` (derivative of the model at x = 1).
 * - **Diminishing returns signal** — when `slope > 0`, each subsequent unit increase in X
 *   produces a smaller gain in Y (classic law of diminishing returns).
 * - **Goodness of fit** — `r2` and `rmse`.
 * - **Baseline** — `intercept` (a) is the predicted Y when x = 1.
 */
export const logarithmic = curry((
  suppliedOptions: Partial<RegressionOptions>,
  data: DataPoint[],
): RegressionResult => {
  const options: RegressionOptions = { ...DEFAULT_OPTIONS, ...suppliedOptions };

  for (let i = 0; i < data.length; i++) {
    const [x, y] = data[i];
    if (!isValid(x) || (y !== null && !isValid(y as number))) {
      return {
        ok: false,
        method: "logarithmic",
        errorType: "InvalidInput",
        message: `Data point at index ${i} contains a non-finite value ([${x}, ${y}]). ` +
          `Logarithmic regression requires finite numerical inputs.`,
      };
    }
  }

  // x must be positive for ln(x) to be defined
  const filteredData = data.filter(
    ([x, y]) => (x as number) > 0 && y !== null
  ) as [number, number][];

  const n = filteredData.length;

  if (n < 2) {
    return {
      ok: false,
      method: "logarithmic",
      errorType: "InsufficientData",
      message: `Logarithmic regression requires at least 2 valid data points with x > 0. ` +
        `Received ${n} qualifying points (points with x ≤ 0 are excluded because ` +
        `ln(x) is undefined for non-positive values).`,
    };
  }

  // Accumulate sums for OLS in log-x space: y = a + b·ln(x)
  let sumLnX = 0, sumYLnX = 0, sumY = 0, sumLnX2 = 0;

  for (const [x, y] of filteredData) {
    const lx = Math.log(x);
    sumLnX  += lx;
    sumYLnX += y * lx;
    sumY    += y;
    sumLnX2 += lx * lx;
  }

  const denominator = n * sumLnX2 - sumLnX ** 2;

  if (denominator === 0) {
    return {
      ok: false,
      method: "logarithmic",
      errorType: "DegenerateInput",
      message: "Cannot compute logarithmic regression: all x-values are identical (all ln(x) values " +
        "are the same), so no unique logarithmic curve can be fitted.",
    };
  }

  const b = (n * sumYLnX - sumY * sumLnX) / denominator;
  const a = (sumY - b * sumLnX) / n;

  if (!isFinite(a) || isNaN(a) || !isFinite(b) || isNaN(b)) {
    return {
      ok: false,
      method: "logarithmic",
      errorType: "MathError",
      message: "Logarithmic regression produced non-finite coefficients. " +
        "Check for extreme y-values or a very narrow range of x values.",
    };
  }

  const coeffA = round(a, options.precision);
  const coeffB = round(b, options.precision);

  const predict = (x: number): PredictedPoint => [
    round(x, options.precision),
    round(coeffA + coeffB * Math.log(x), options.precision),
  ];

  const points = data.map(([x]) => predict(x));
  const r2 = rSquared(data, points);

  const sign = coeffB < 0 ? "−" : "+";
  const absB = Math.abs(coeffB);
  const equation = `y = ${coeffA} ${sign} ${absB}·ln(x)`;

  return {
    ok: true,
    method: "logarithmic",
    slope: coeffB,      // Coefficient of ln(x)
    intercept: coeffA,  // Constant term (predicted Y when x = 1)
    r2: round(r2, options.precision),
    rmse: round(rmse(data, points), options.precision),
    n,
    points,
    predict,
    equation,
  };
});
