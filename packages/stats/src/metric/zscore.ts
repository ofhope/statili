import { mean, standardDeviation } from "@statili/math";

/**
 * Represents the successful result of a Z-score calculation for a single data point.
 */
type ZScoreSuccess = {
  ok: true;
  /** The calculated Z-score for the data point. */
  value: number;
};

/**
 * Represents an error encountered during a Z-score calculation for a single data point.
 */
type ZScoreError = {
  ok: false;
  /** The type of error that occurred (e.g., 'ZeroStandardDeviation'). */
  errorType: "ZeroStandardDeviation";
  /** A detailed message explaining the error. */
  message: string;
};

/**
 * The union type for the result of a single Z-score calculation,
 * which can be either a success or an error.
 */
type ZScoreResult = ZScoreSuccess | ZScoreError;

/**
 * Calculates the Z-score for a given data point relative to a dataset's mean and standard deviation.
 * The Z-score quantifies how many standard deviations a data point is from the mean.
 * This function returns a discriminant union to explicitly handle success and error cases.
 *
 * @param value The individual data point for which to calculate the Z-score.
 * @param mean The mean (average) of the dataset.
 * @param stdDev The standard deviation of the dataset.
 * @returns A `ZScoreResult` indicating either the calculated Z-score (`ok: true, value: number`)
 * or an error (`ok: false, errorType: "ZeroStandardDeviation", message: string`)
 * if the standard deviation is zero.
 *
 * @example
 * ```typescript
 * const value = 15;
 * const mean = 10;
 * const stdDev = 2;
 * const result = calculateZScore(value, mean, stdDev);
 * // result will be { ok: true, value: 2.5 }
 *
 * const value2 = 5;
 * const mean2 = 5;
 * const stdDev2 = 0; // Represents a dataset where all values are 5
 * const result2 = calculateZScore(value2, mean2, stdDev2);
 * // result2 will be { ok: false, errorType: "ZeroStandardDeviation", message: "Standard deviation is zero, cannot calculate Z-score." }
 * ```
 */
export function calculateZScore(
  value: number,
  mean: number,
  stdDev: number
): ZScoreResult {
  if (stdDev === 0) {
    // Return an error for the mathematically undefined case.
    return {
      ok: false,
      errorType: "ZeroStandardDeviation",
      message: "Standard deviation is zero, cannot calculate Z-score. This typically occurs when all data points in the dataset are identical, making it impossible to measure deviation from the mean.",
    };
  }
  return {
    ok: true,
    value: (value - mean) / stdDev,
  };
}

/**
 * Calculates the mean (average) of a numerical dataset.
 * Delegates to `@statili/math` for the computation.
 *
 * @param data The array of numerical data points.
 * @returns The mean of the dataset, or NaN if the array is empty.
 */
export function calculateMean(data: number[]): number {
  return mean(data);
}

/**
 * Calculates the sample standard deviation of a numerical dataset.
 * Uses the 'n-1' correction (Bessel's correction).
 * Delegates to `@statili/math` for the computation.
 *
 * @param data The array of numerical data points.
 * @returns The sample standard deviation of the dataset, or NaN if the array has less than 2 elements.
 */
export function calculateStandardDeviation(data: number[]): number {
  return standardDeviation(data);
}

/**
 * Calculates Z-scores for all data points in a dataset, identifying potential outliers.
 * This function handles the overall dataset calculation (mean, stdDev) and then
 * applies the Z-score calculation for each individual point.
 * It returns a structured object containing the calculated Z-scores, the mean,
 * and standard deviation, or an error if the calculation cannot be performed.
 *
 * @param data The array of numerical data points for which to calculate Z-scores.
 * @returns An object with `ok: true` and an array of `ZScoreResult` for each data point,
 * along with the calculated `mean` and `stdDev`.
 * If the dataset is too small or has no variance, an error object is returned.
 *
 * @example
 * ```typescript
 * const data = [10, 12, 10, 11, 13, 100];
 * const result = getZScoresForDataset(data);
 *
 * if (result.ok) {
 * console.log("Mean:", result.mean);
 * console.log("Standard Deviation:", result.stdDev);
 * result.zScores.forEach((z, index) => {
 * if (z.ok) {
 * console.log(`Data point ${data[index]} has Z-score: ${z.value}`);
 * } else {
 * console.error(`Error for data point ${data[index]}: ${z.message}`);
 * }
 * });
 * } else {
 * console.error("Dataset Z-score calculation failed:", result.message);
 * }
 * ```
 */
type DatasetZScoreSuccess = {
  ok: true;
  /** An array of ZScoreResult for each data point in the input array. */
  zScores: ZScoreResult[];
  /** The calculated mean of the dataset. */
  mean: number;
  /** The calculated standard deviation of the dataset. */
  stdDev: number;
};

type DatasetZScoreError = {
  ok: false;
  errorType: "InsufficientData" | "NoVariance";
  message: string;
};

type DatasetZScoreResult = DatasetZScoreSuccess | DatasetZScoreError;

export function getZScoresForDataset(data: number[]): DatasetZScoreResult {
  if (data.length < 2) {
    return {
      ok: false,
      errorType: "InsufficientData",
      message: "Cannot calculate Z-scores for a dataset with less than 2 data points. At least two points are needed to compute a standard deviation.",
    };
  }

  const m = mean(data);
  const stdDev = standardDeviation(data);

  if (isNaN(stdDev) || stdDev === 0) {
    return {
      ok: false,
      errorType: "NoVariance",
      message: "The dataset has no variance (all data points are identical), so Z-scores cannot be calculated as the standard deviation is zero.",
    };
  }

  const zScores: ZScoreResult[] = data.map(val => calculateZScore(val, m, stdDev));

  return {
    ok: true,
    zScores,
    mean: m,
    stdDev,
  };
}
