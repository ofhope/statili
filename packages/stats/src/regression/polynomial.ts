import { curry } from "@statili/fp";
import { DEFAULT_OPTIONS } from "./const";
import type { DataPoint, PredictedPoint, RegressionOptions, RegressionResult } from "./types";
import { gaussianElimination, isValid, rmse, round, rSquared } from "./util";

/**
 * Performs polynomial regression of configurable degree.
 *
 * Fits the curve **y = c₀ + c₁x + c₂x² + … + cₙxⁿ** by solving the normal
 * equations via Gaussian elimination with partial pivoting.
 *
 * @param suppliedOptions - `{ precision?, order? }` — `order` sets the polynomial
 *   degree (default 2). Increasing degree improves fit but risks overfitting when
 *   `n` is close to `order + 1`.
 * @param data - Array of `[x, y]` tuples. Requires at least `order + 1` valid points.
 * @returns Discriminant union:
 *   - `ok: true`  — includes `coefficients`, `degree`, `equation`, `r2`, `rmse`, `n`, `predict`.
 *   - `ok: false` — includes `errorType` and `message`.
 *
 * @example
 * // Quadratic fit (default)
 * const data: DataPoint[] = [[1,1],[2,4],[3,9],[4,16],[5,25]];
 * const result = polynomial({}, data);
 * if (result.ok) {
 *   console.log(result.equation);       // "y = 1x² + 0x + 0"
 *   console.log(result.r2);             // ≈ 1
 *   console.log(result.predict(6)[1]);  // ≈ 36
 * }
 *
 * @example
 * // Cubic fit
 * const cubic = polynomial({ order: 3, precision: 4 }, data);
 *
 * @example
 * // Curried / partial application (data-last)
 * const fitQuadratic = polynomial({ order: 2 });
 * const result = fitQuadratic(data);
 *
 * @description
 * **Insights derivable from the result (for use by @statili/forge):**
 * - **Curve shape** — `degree` and the sign of the leading coefficient determine
 *   whether the curve opens upward / downward (quadratic) or has inflection points (cubic+).
 * - **Goodness of fit** — `r2` and `rmse` as with linear regression.
 * - **Overfit risk** — high `degree` relative to `n` (rule of thumb: `degree > n / 3`)
 *   suggests the model may be fitting noise rather than signal.
 * - **Vertex / extremum** — for a quadratic y = c₂x² + c₁x + c₀,
 *   the vertex is at x = −c₁ / (2c₂).
 */
export const polynomial = curry((
  suppliedOptions: Partial<RegressionOptions>,
  data: DataPoint[],
): RegressionResult => {
  const options: RegressionOptions = { ...DEFAULT_OPTIONS, ...suppliedOptions };
  const degree = options.order ?? 2;
  const k = degree + 1; // number of coefficients

  if (!Number.isInteger(degree) || degree < 1) {
    return {
      ok: false,
      method: "polynomial",
      errorType: "InvalidInput",
      message: `Polynomial degree must be a positive integer. Received: ${degree}.`,
    };
  }

  for (let i = 0; i < data.length; i++) {
    const [x, y] = data[i];
    if (!isValid(x) || (y !== null && !isValid(y as number))) {
      return {
        ok: false,
        method: "polynomial",
        errorType: "InvalidInput",
        message: `Data point at index ${i} contains a non-finite value ([${x}, ${y}]). ` +
          `Polynomial regression requires finite numerical inputs.`,
      };
    }
  }

  const filteredData = data.filter(([, y]) => y !== null) as [number, number][];
  const n = filteredData.length;

  if (n < k) {
    return {
      ok: false,
      method: "polynomial",
      errorType: "InsufficientData",
      message: `Polynomial regression of degree ${degree} requires at least ${k} valid data ` +
        `points (one per coefficient). Received ${n}.`,
    };
  }

  // Build the augmented normal-equations matrix [A | b] where A[i][j] = Σ xᵏ⁽ⁱ⁺ʲ⁾
  // and b[i] = Σ yᵢ·xᵢⁱ.
  const matrix: number[][] = [];
  for (let i = 0; i < k; i++) {
    const row: number[] = [];
    for (let j = 0; j < k; j++) {
      row.push(filteredData.reduce((s, [x]) => s + x ** (i + j), 0));
    }
    // Augmented column: Σ yᵢ·xᵢⁱ
    row.push(filteredData.reduce((s, [x, y]) => s + y * x ** i, 0));
    matrix.push(row);
  }

  const rawCoeffs = gaussianElimination(matrix, k);

  if (rawCoeffs.some(isNaN)) {
    return {
      ok: false,
      method: "polynomial",
      errorType: "NumericalStability",
      message: `Polynomial regression of degree ${degree} produced a singular normal-equations ` +
        `matrix. This typically occurs when x-values are highly collinear, all identical, ` +
        `or the degree exceeds the number of unique x positions.`,
    };
  }

  const coefficients = rawCoeffs.map(c => round(c, options.precision));

  const predict = (x: number): PredictedPoint => [
    round(x, options.precision),
    round(coefficients.reduce((sum, c, p) => sum + c * x ** p, 0), options.precision),
  ];

  const points = data.map(([x]) => predict(x));
  const r2 = rSquared(data, points);

  if (isNaN(r2)) {
    return {
      ok: false,
      method: "polynomial",
      errorType: "MathError",
      message: "R² calculation failed. This can occur if all y-values are identical (zero variance in Y).",
    };
  }

  // Build equation string in descending-power notation: "y = cₙxⁿ + … + c₁x + c₀"
  const eqParts: string[] = [];
  for (let i = degree; i >= 0; i--) {
    const c = coefficients[i];
    if (i === 0) eqParts.push(`${c}`);
    else if (i === 1) eqParts.push(`${c}x`);
    else eqParts.push(`${c}x^${i}`);
  }
  const equation = `y = ${eqParts.join(" + ").replace(/\+ -/g, "- ")}`;

  return {
    ok: true,
    method: "polynomial",
    slope: coefficients[1] ?? 0,   // c₁ — the linear term
    intercept: coefficients[0],    // c₀ — the constant term
    r2: round(r2, options.precision),
    rmse: round(rmse(data, points), options.precision),
    n,
    points,
    predict,
    coefficients,
    degree,
    equation,
  };
});
