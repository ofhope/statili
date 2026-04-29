import { curry } from "@statili/fp";
import type {
  LogisticRegressionOptions,
  MultiDataPoint,
  MultiRegressionResult,
  PredictedMultiPoint,
} from "./types";
import { rmseFromYValues, round, rSquaredFromYValues } from "./util";

const DEFAULT_LOGISTIC_OPTIONS: LogisticRegressionOptions = {
  learningRate: 0.1,
  iterations: 1000,
  precision: 4,
};

/**
 * Sigmoid (logistic) activation function σ(z) = 1 / (1 + e⁻ᶻ).
 * Maps any real number to the open interval (0, 1).
 */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Performs binary logistic regression via batch gradient descent.
 *
 * Models the probability that an observation belongs to class 1:
 * **P(y=1 | x) = σ(b₀ + b₁x₁ + b₂x₂ + … + bₖxₖ)**
 * where σ is the sigmoid function. Predictions at P ≥ 0.5 are classified as 1.
 *
 * **y must be binary:** each observation's `y` value must be exactly `0` or `1`.
 *
 * @param suppliedOptions - Optional `{ learningRate?, iterations?, precision? }`.
 * @param data - Array of `{ x: number[], y: 0 | 1 | null }` observations.
 * @returns Discriminant union:
 *   - `ok: true`  — includes `coefficients` ([b₀, …, bₖ]), `r2` (McFadden pseudo-R²),
 *                   `accuracy` (proportion correctly classified), `n`, `predict`.
 *   - `ok: false` — includes `errorType` and `message`.
 *
 * @example
 * // Classify pass (1) / fail (0) from study hours and practice problems
 * const data: MultiDataPoint[] = [
 *   { x: [1, 5],  y: 0 }, { x: [2, 10], y: 0 }, { x: [3, 15], y: 0 },
 *   { x: [4, 20], y: 1 }, { x: [5, 25], y: 1 }, { x: [6, 30], y: 1 },
 * ];
 * const result = logistic({}, data);
 * if (result.ok) {
 *   console.log(result.accuracy);               // e.g. 0.9167 (91.67%)
 *   console.log(result.predict([4.5, 22]).y);   // probability ≈ 0.72
 * }
 *
 * @example
 * // Curried / partial application (data-last)
 * const fitLogistic = logistic({ learningRate: 0.05, iterations: 2000 });
 * const result = fitLogistic(data);
 *
 * @description
 * **Insights derivable from the result (for use by @statili/forge):**
 * - **Classification quality** — `accuracy` (proportion of training observations
 *   correctly classified at the 0.5 threshold).
 * - **Model fit** — `r2` (McFadden pseudo-R²): values ≥ 0.2 indicate good fit,
 *   ≥ 0.4 indicate excellent fit (scale differs from ordinary R²).
 * - **Feature direction** — positive coefficient bᵢ → feature i increases P(y=1);
 *   negative → it decreases P(y=1).
 * - **Decision boundary** — the boundary where P(y=1) = 0.5 is where the
 *   linear predictor equals 0: b₀ + b₁x₁ + … = 0.
 * - **Odds interpretation** — e^bᵢ is the odds multiplier per unit increase in xᵢ.
 */
export const logistic = curry((
  suppliedOptions: Partial<LogisticRegressionOptions>,
  data: MultiDataPoint[],
): MultiRegressionResult => {
  const options: LogisticRegressionOptions = {
    ...DEFAULT_LOGISTIC_OPTIONS,
    ...suppliedOptions,
  };

  const filteredData = data.filter(d => d.y !== null) as { x: number[]; y: number }[];
  const n = filteredData.length;

  if (n < 2) {
    return {
      ok: false,
      method: "logistic",
      errorType: "InsufficientData",
      message: "Logistic regression requires at least 2 valid observations with non-null y values. " +
        `Received ${n}.`,
    };
  }

  // Validate binary labels
  const nonBinary = filteredData.find(d => d.y !== 0 && d.y !== 1);
  if (nonBinary !== undefined) {
    return {
      ok: false,
      method: "logistic",
      errorType: "InvalidInput",
      message: "Logistic regression requires binary y-values: each observation must be 0 or 1. " +
        `Detected non-binary value: ${nonBinary.y}. If your outcome is continuous, ` +
        "consider linear or polynomial regression instead.",
    };
  }

  const numFeatures = filteredData[0].x.length;

  if (numFeatures === 0) {
    return {
      ok: false,
      method: "logistic",
      errorType: "InvalidInput",
      message: "Each data point must have at least one feature (x must be a non-empty array).",
    };
  }

  // Validate consistent feature dimensionality
  for (let i = 0; i < filteredData.length; i++) {
    if (filteredData[i].x.length !== numFeatures) {
      return {
        ok: false,
        method: "logistic",
        errorType: "InvalidInput",
        message: `Inconsistent feature dimensions: data point at index ${i} has ` +
          `${filteredData[i].x.length} feature(s) but the first point has ${numFeatures}.`,
      };
    }
  }

  // Check that both classes are present
  const hasBoth = filteredData.some(d => d.y === 0) && filteredData.some(d => d.y === 1);
  if (!hasBoth) {
    return {
      ok: false,
      method: "logistic",
      errorType: "DegenerateInput",
      message: "Logistic regression requires observations from both classes (y=0 and y=1). " +
        "Only one class was found in the data — a classifier cannot be fitted.",
    };
  }

  // ── Batch gradient descent ────────────────────────────────────────────────
  // coefficients = [b₀, b₁, …, bₖ], initialised to zero
  const coefficients: number[] = new Array(numFeatures + 1).fill(0);

  for (let iter = 0; iter < options.iterations; iter++) {
    const gradients: number[] = new Array(numFeatures + 1).fill(0);

    for (const point of filteredData) {
      const xAug = [1, ...point.x]; // prepend intercept term
      const z = xAug.reduce((s, xi, j) => s + xi * coefficients[j], 0);
      const pHat = sigmoid(z);
      const error = point.y - pHat; // gradient ascent on log-likelihood

      for (let j = 0; j <= numFeatures; j++) {
        gradients[j] += error * xAug[j];
      }
    }

    for (let j = 0; j <= numFeatures; j++) {
      coefficients[j] += options.learningRate * gradients[j];
    }
  }

  const roundedCoeffs = coefficients.map(c => round(c, options.precision));

  const predict = (x_values: number[]): PredictedMultiPoint => {
    if (x_values.length !== numFeatures) {
      throw new Error(
        `predict() received ${x_values.length} feature(s) but the model was trained on ` +
        `${numFeatures}. Ensure the input vector matches the training feature dimension.`,
      );
    }
    const xAug = [1, ...x_values];
    const z    = xAug.reduce((s, xi, j) => s + xi * roundedCoeffs[j], 0);
    return { x: x_values, y: round(sigmoid(z), options.precision) };
  };

  const points: PredictedMultiPoint[] = data.map(d => predict(d.x));

  // ── Accuracy: proportion correctly classified at P ≥ 0.5 ─────────────────
  const trainPredictions = filteredData.map(d => predict(d.x).y);
  const correct = filteredData.filter((d, i) => {
    const predicted = trainPredictions[i] >= 0.5 ? 1 : 0;
    return predicted === d.y;
  }).length;
  const accuracy = round(correct / n, options.precision);

  // ── McFadden's pseudo-R² ─────────────────────────────────────────────────
  // R²_McFadden = 1 − (logLik_model / logLik_null)
  const eps = 1e-15; // avoid log(0)
  const pBar = filteredData.reduce((s, d) => s + d.y, 0) / n;
  const logLikNull  = n * (pBar * Math.log(pBar + eps) + (1 - pBar) * Math.log(1 - pBar + eps));
  const logLikModel = filteredData.reduce((s, d, i) => {
    const p = trainPredictions[i];
    return s + d.y * Math.log(p + eps) + (1 - d.y) * Math.log(1 - p + eps);
  }, 0);
  const pseudoR2 = logLikNull !== 0
    ? round(1 - logLikModel / logLikNull, options.precision)
    : NaN;

  // ── RMSE (training residuals — less meaningful for classification) ────────
  const actualY    = filteredData.map(d => d.y);
  const predictedP = filteredData.map(d => predict(d.x).y);
  const rmse = rmseFromYValues(actualY, predictedP);

  // ── Equation string ───────────────────────────────────────────────────────
  const innerTerms = roundedCoeffs.slice(1)
    .map((b, i) => {
      const sign = b < 0 ? " − " : " + ";
      return `${sign}${Math.abs(b)}·x${i + 1}`;
    })
    .join("");
  const equation = `P(y=1) = σ(${roundedCoeffs[0]}${innerTerms})`;

  return {
    ok: true,
    method: "logistic",
    coefficients: roundedCoeffs,
    numFeatures,
    r2: pseudoR2,
    rmse: round(rmse, options.precision),
    n,
    points,
    predict,
    equation,
    accuracy,
  };
});
