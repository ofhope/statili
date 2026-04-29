import { curry } from "@statili/fp";
import { DEFAULT_OPTIONS } from "./const";
import type {
  MultiDataPoint,
  MultiRegressionResult,
  PredictedMultiPoint,
  RegressionOptions,
} from "./types";
import { gaussianElimination, rmseFromYValues, round, rSquaredFromYValues } from "./util";

/**
 * Performs Multiple Linear Regression (MLR) to model the relationship:
 * **y = b₀ + b₁x₁ + b₂x₂ + … + bₖxₖ**
 *
 * Coefficients are found by solving the normal equations:
 * **(Xᵀ X) β = Xᵀ y** via Gaussian elimination with partial pivoting.
 *
 * @param suppliedOptions - Optional `{ precision }` overrides.
 * @param data - Array of `{ x: number[], y: number | null }` observations.
 *   All observations must share the same feature dimension (`x.length`).
 *   Observations with `y === null` are excluded from the fit.
 * @returns Discriminant union:
 *   - `ok: true`  — includes `coefficients` ([b₀, b₁, …, bₖ]), `r2`, `rmse`,
 *                   `n`, `numFeatures`, `equation`, `predict`.
 *   - `ok: false` — includes `errorType` and `message`.
 *
 * @example
 * // Predict house price from square footage and bedrooms
 * const data: MultiDataPoint[] = [
 *   { x: [850,  2], y: 210000 },
 *   { x: [1200, 3], y: 290000 },
 *   { x: [1500, 3], y: 340000 },
 *   { x: [1800, 4], y: 420000 },
 *   { x: [2100, 4], y: 480000 },
 * ];
 * const result = multilinear({}, data);
 * if (result.ok) {
 *   console.log(result.equation);
 *   // "y = -12500 + 220x₁ + 15000x₂"
 *   console.log(result.predict([1600, 3]).y);
 *   // predicted price for 1600 sqft, 3 bedrooms
 * }
 *
 * @example
 * // Curried / partial application (data-last)
 * const fitMLR = multilinear({ precision: 4 });
 * const result = fitMLR(data);
 *
 * @description
 * **Insights derivable from the result (for use by @statili/forge):**
 * - **Model fit** — `r2` quantifies the proportion of variance explained across all features.
 * - **Prediction accuracy** — `rmse` in Y-axis units.
 * - **Feature direction** — positive `bᵢ` means feature i increases Y; negative decreases Y.
 * - **Relative importance** — larger absolute coefficient → greater marginal effect on Y
 *   (only comparable when features are on the same scale).
 * - **Multicollinearity warning** — a `NumericalStability` error often indicates that two
 *   or more features are highly correlated.
 */
export const multilinear = curry((
  suppliedOptions: Partial<RegressionOptions>,
  data: MultiDataPoint[],
): MultiRegressionResult => {
  const options: RegressionOptions = { ...DEFAULT_OPTIONS, ...suppliedOptions };

  const filteredData = data.filter(d => d.y !== null) as { x: number[]; y: number }[];
  const n = filteredData.length;

  if (n === 0) {
    return {
      ok: false,
      method: "multilinear",
      errorType: "InsufficientData",
      message: "Multiple linear regression requires at least one valid observation " +
        "(a data point with a non-null y value).",
    };
  }

  const numFeatures = filteredData[0].x.length;

  if (numFeatures === 0) {
    return {
      ok: false,
      method: "multilinear",
      errorType: "InvalidInput",
      message: "Each data point must have at least one feature (x must be a non-empty array).",
    };
  }

  // Validate consistent feature dimensionality
  for (let i = 0; i < filteredData.length; i++) {
    if (filteredData[i].x.length !== numFeatures) {
      return {
        ok: false,
        method: "multilinear",
        errorType: "InvalidInput",
        message: `Inconsistent feature dimensions: data point at index ${i} has ` +
          `${filteredData[i].x.length} feature(s) but the first point has ${numFeatures}. ` +
          `All observations must share the same number of features.`,
      };
    }
  }

  // We need at least (numFeatures + 1) observations to identify all coefficients
  if (n < numFeatures + 1) {
    return {
      ok: false,
      method: "multilinear",
      errorType: "InsufficientData",
      message: `Multiple linear regression with ${numFeatures} feature(s) requires at least ` +
        `${numFeatures + 1} valid observations (one per coefficient). Received ${n}.`,
    };
  }

  // Build design matrix X (n × k where k = numFeatures + 1) — prepend intercept column of 1s
  const k = numFeatures + 1;
  const X: number[][] = filteredData.map(d => [1, ...d.x]);
  const Y: number[]   = filteredData.map(d => d.y);

  // Compute XᵀX (k × k) and XᵀY (k × 1)
  const XtX: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const XtY: number[]   = new Array(k).fill(0);

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      for (let m = 0; m < n; m++) XtX[i][j] += X[m][i] * X[m][j];
    }
    for (let m = 0; m < n; m++) XtY[i] += X[m][i] * Y[m];
  }

  // Augmented matrix [XᵀX | XᵀY]
  const augmented: number[][] = XtX.map((row, i) => [...row, XtY[i]]);
  const rawCoeffs = gaussianElimination(augmented, k);

  if (rawCoeffs.some(isNaN)) {
    return {
      ok: false,
      method: "multilinear",
      errorType: "NumericalStability",
      message: "Multiple linear regression encountered a singular or ill-conditioned matrix. " +
        "This commonly occurs when two or more features are highly correlated (multicollinearity), " +
        "or when the number of observations is very close to the number of coefficients. " +
        "Consider removing redundant features or collecting more data.",
    };
  }

  const coefficients = rawCoeffs.map(c => round(c, options.precision));

  const predict = (x_values: number[]): PredictedMultiPoint => {
    if (x_values.length !== numFeatures) {
      throw new Error(
        `predict() received ${x_values.length} feature(s) but the model was trained on ` +
        `${numFeatures}. Ensure the input vector matches the training feature dimension.`,
      );
    }
    const yHat = coefficients[0] + coefficients.slice(1).reduce((s, b, i) => s + b * x_values[i], 0);
    return { x: x_values, y: round(yHat, options.precision) };
  };

  const points: PredictedMultiPoint[] = data.map(d => predict(d.x));

  // R² and RMSE use only the filtered (non-null y) observations
  const actualY    = filteredData.map(d => d.y);
  const predictedY = filteredData.map(d => predict(d.x).y);
  const r2   = rSquaredFromYValues(actualY, predictedY);
  const rmse = rmseFromYValues(actualY, predictedY);

  // Human-readable equation: y = b₀ + b₁x₁ + b₂x₂ + …
  const intercept = coefficients[0];
  const featureTerms = coefficients.slice(1)
    .map((b, i) => {
      const sign = b < 0 ? "− " : "+ ";
      return `${sign}${Math.abs(b)}x${i + 1}`;
    })
    .join(" ");
  const equation = `y = ${intercept} ${featureTerms}`.trim();

  return {
    ok: true,
    method: "multilinear",
    coefficients,
    numFeatures,
    r2: round(r2, options.precision),
    rmse: round(rmse, options.precision),
    n,
    points,
    predict,
    equation,
  };
});
