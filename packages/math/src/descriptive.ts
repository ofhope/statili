/**
 * Returns the sum of all values in `numbers`.
 *
 * Returns `0` for an empty array (the additive identity), consistent with
 * standard mathematical convention and most statistics libraries.
 *
 * @param numbers - Array of finite numbers.
 * @returns The sum, or `0` if the array is empty.
 *
 * @example
 * sum([1, 2, 3, 4])  // 10
 * sum([])            // 0
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, x) => acc + x, 0);
}

/**
 * Returns the arithmetic mean (average) of `numbers`.
 *
 * Returns `NaN` for an empty array — there is no meaningful average of zero
 * values. Downstream consumers should guard with `isNaN(result)`.
 *
 * @param numbers - Array of finite numbers.
 * @returns The mean, or `NaN` if the array is empty.
 *
 * @example
 * mean([2, 4, 6])  // 4
 * mean([])         // NaN
 *
 * @description
 * **Insights** — the mean is the foundation for variance, standard deviation,
 * z-scores, and OLS regression. A large gap between `mean` and `median`
 * signals skew in the distribution.
 */
export function mean(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  return sum(numbers) / numbers.length;
}

/**
 * Returns the median (middle value) of `numbers`.
 *
 * - For an **odd** count the median is the exact middle element of the sorted
 *   array.
 * - For an **even** count it is the mean of the two middle elements.
 *
 * Returns `NaN` for an empty array.
 *
 * @param numbers - Array of finite numbers (need not be pre-sorted).
 * @returns The median value, or `NaN` if the array is empty.
 *
 * @example
 * median([3, 1, 4, 1, 5])   // 3
 * median([1, 2, 3, 4])      // 2.5
 * median([])                // NaN
 *
 * @description
 * **Insights** — the median is robust to outliers and preferred over the mean
 * for skewed distributions (e.g. salaries, house prices). Use alongside
 * `mean` to detect skew: `mean > median` → right-skewed; `mean < median` →
 * left-skewed.
 */
export function median(numbers: number[]): number {
  const n = numbers.length;
  if (n === 0) return NaN;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  return n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Returns the **sample variance** of `numbers` (Bessel's correction, divided
 * by `n − 1`).
 *
 * Use `ddof: 0` to obtain the **population variance** (divided by `n`), which
 * is appropriate when `numbers` represents an entire population rather than a
 * sample.
 *
 * Returns `NaN` when:
 * - The array is empty.
 * - `ddof = 1` and the array has fewer than 2 elements (variance is
 *   undefined for a single-element sample).
 *
 * @param numbers - Array of finite numbers.
 * @param ddof    - Delta degrees of freedom: `1` (default) = sample variance,
 *                  `0` = population variance.
 * @returns The variance, or `NaN` for degenerate inputs.
 *
 * @example
 * variance([2, 4, 4, 4, 5, 5, 7, 9])        // 4.571... (sample)
 * variance([2, 4, 4, 4, 5, 5, 7, 9], 0)     // 4        (population)
 * variance([42])                             // NaN      (single-element sample)
 *
 * @description
 * **Insights** — variance quantifies the spread of data around the mean.
 * High variance signals noisy or widely-distributed data; low variance
 * signals tightly clustered data. It is the square of `standardDeviation`.
 */
export function variance(numbers: number[], ddof: 0 | 1 = 1): number {
  const n = numbers.length;
  if (n === 0) return NaN;
  if (ddof === 1 && n < 2) return NaN;
  const m = mean(numbers);
  const sumSq = numbers.reduce((acc, x) => acc + (x - m) ** 2, 0);
  return sumSq / (n - ddof);
}

/**
 * Returns the **sample standard deviation** of `numbers` (Bessel's
 * correction, divided by `n − 1`).
 *
 * Use `ddof: 0` for the population standard deviation.
 *
 * Returns `NaN` for an empty array or a single-element array when `ddof = 1`.
 *
 * @param numbers - Array of finite numbers.
 * @param ddof    - Delta degrees of freedom: `1` (default) = sample std dev,
 *                  `0` = population std dev.
 * @returns The standard deviation, or `NaN` for degenerate inputs.
 *
 * @example
 * standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])     // ≈ 2.138 (sample)
 * standardDeviation([2, 4, 4, 4, 5, 5, 7, 9], 0)  // 2       (population)
 *
 * @description
 * **Insights** — std dev is the most common measure of data spread, expressed
 * in the same units as the data (unlike variance). It is used to compute
 * z-scores, confidence intervals, and to detect outliers (points beyond
 * ±2–3 std devs). Compared to `mad`, std dev is sensitive to outliers.
 */
export function standardDeviation(numbers: number[], ddof: 0 | 1 = 1): number {
  return Math.sqrt(variance(numbers, ddof));
}

/**
 * Returns the **minimum** value in `numbers`.
 *
 * Returns `NaN` for an empty array.
 *
 * @param numbers - Array of finite numbers.
 * @returns The smallest element, or `NaN` if the array is empty.
 *
 * @example
 * min([3, 1, 4, 1, 5, 9])  // 1
 * min([])                  // NaN
 */
export function min(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  return Math.min(...numbers);
}

/**
 * Returns the **maximum** value in `numbers`.
 *
 * Returns `NaN` for an empty array.
 *
 * @param numbers - Array of finite numbers.
 * @returns The largest element, or `NaN` if the array is empty.
 *
 * @example
 * max([3, 1, 4, 1, 5, 9])  // 9
 * max([])                  // NaN
 */
export function max(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  return Math.max(...numbers);
}

/**
 * Returns the **range** — the difference between the maximum and minimum
 * values.
 *
 * Returns `NaN` for an empty array.
 *
 * @param numbers - Array of finite numbers.
 * @returns `max(numbers) − min(numbers)`, or `NaN` if the array is empty.
 *
 * @example
 * range([3, 1, 4, 1, 5, 9])  // 8   (9 − 1)
 * range([7])                  // 0
 * range([])                   // NaN
 *
 * @description
 * **Insights** — the range gives a quick sense of data spread but is highly
 * sensitive to outliers. Prefer `standardDeviation` or `iqr` (interquartile
 * range via `quantile`) for robust spread estimates.
 */
export function range(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  return max(numbers) - min(numbers);
}

/**
 * Returns the value at quantile `p` using **linear interpolation** between
 * adjacent ranks (equivalent to R's Type 7 / NumPy's default method).
 *
 * The array does **not** need to be pre-sorted.
 *
 * **Partial-application pattern** — `p` (the quantile level) is the
 * infrequently-changing argument; `numbers` (the data) is last:
 * ```ts
 * const median    = quantile(0.5);
 * const p25       = quantile(0.25);
 * const p75       = quantile(0.75);
 * const iqr       = (data: number[]) => p75(data) - p25(data);
 * ```
 *
 * @param p       - Quantile level in `[0, 1]`. `0.5` = median, `0.25` = Q1,
 *                  `0.75` = Q3. Throws a `RangeError` if outside `[0, 1]`.
 * @param numbers - Array of finite numbers.
 * @returns The interpolated quantile value, or `NaN` if the array is empty.
 *
 * @example
 * quantile(0.5, [1, 2, 3, 4, 5])   // 3     (median)
 * quantile(0.25, [1, 2, 3, 4])     // 1.75  (Q1)
 * quantile(0.75, [1, 2, 3, 4])     // 3.25  (Q3)
 * quantile(0, [5, 3, 1])           // 1     (min)
 * quantile(1, [5, 3, 1])           // 5     (max)
 *
 * @description
 * **Insights** — quantiles divide data into equal-probability regions.
 * Common uses:
 * - **Interquartile range (IQR)** = Q3 − Q1 (robust spread, used in
 *   box-plots and outlier detection).
 * - **Percentile ranks** communicate where a value sits in a distribution.
 * - **Tail analysis** — extreme quantiles (p = 0.01, p = 0.99) surface
 *   outlier thresholds for anomaly-detection annotations in charts.
 */
export function quantile(p: number, numbers: number[]): number {
  if (p < 0 || p > 1) throw new RangeError(`quantile: p must be in [0, 1], received ${p}.`);
  const n = numbers.length;
  if (n === 0) return NaN;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = p * (n - 1);
  const lower = Math.floor(index);
  const upper = lower + 1;
  const fraction = index - lower;
  if (upper >= n) return sorted[lower];
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Returns the **Median Absolute Deviation (MAD)** — the median of absolute
 * deviations from the dataset's median.
 *
 * MAD is a robust measure of spread that is far less sensitive to outliers
 * than `standardDeviation`. A scaled MAD (`1.4826 × MAD`) approximates the
 * standard deviation for normally-distributed data.
 *
 * Returns `NaN` for an empty array.
 *
 * @param numbers - Array of finite numbers.
 * @returns The MAD value, or `NaN` if the array is empty.
 *
 * @example
 * mad([1, 1, 2, 2, 4, 6, 9])  // 1
 * mad([])                     // NaN
 *
 * @description
 * **Insights** — use MAD instead of standard deviation when your dataset
 * contains suspected outliers. In a chart context, data points beyond
 * `median ± 3 × 1.4826 × MAD` can be flagged as anomalies in a
 * distribution-agnostic way.
 */
export function mad(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  const m = median(numbers);
  return median(numbers.map(x => Math.abs(x - m)));
}

/**
 * Returns the **sample covariance** between two equal-length arrays `xs` and
 * `ys` (divided by `n − 1`).
 *
 * Covariance measures the joint variability of two variables — a positive
 * value means they tend to increase together; a negative value means one
 * tends to decrease as the other increases.
 *
 * Returns `NaN` when:
 * - Either array is empty.
 * - The arrays have different lengths.
 * - There is fewer than 2 paired observations.
 *
 * @param xs - Array of independent-variable values.
 * @param ys - Array of dependent-variable values (same length as `xs`).
 * @returns Sample covariance, or `NaN` for degenerate inputs.
 *
 * @example
 * covariance([1, 2, 3], [4, 5, 6])   //  1 (perfect positive covariance)
 * covariance([1, 2, 3], [6, 5, 4])   // -1 (perfect negative covariance)
 * covariance([1, 2, 3], [3, 3, 3])   //  0 (no covariance)
 *
 * @description
 * **Insights** — covariance is the numerator of the Pearson correlation
 * coefficient and also appears directly in the OLS slope formula
 * (`slope = cov(x, y) / var(x)`), making it a foundational primitive for
 * `@statili/stats` regression methods.
 */
export function covariance(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n !== ys.length || n < 2) return NaN;
  const mx = mean(xs);
  const my = mean(ys);
  return xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0) / (n - 1);
}

/**
 * Returns the **Pearson product-moment correlation coefficient** between `xs`
 * and `ys`, always in the range `[−1, 1]`.
 *
 * - `r ≈  1` → strong positive linear relationship
 * - `r ≈ −1` → strong negative linear relationship
 * - `r ≈  0` → no linear relationship
 *
 * Returns `NaN` when:
 * - Either array is empty or their lengths differ.
 * - Either array has zero variance (all values identical), making
 *   the correlation mathematically undefined.
 *
 * @param xs - First variable (same length as `ys`).
 * @param ys - Second variable (same length as `xs`).
 * @returns Pearson r in `[−1, 1]`, or `NaN` for degenerate inputs.
 *
 * @example
 * pearsonCorrelation([1, 2, 3], [4, 5, 6])   //  1
 * pearsonCorrelation([1, 2, 3], [6, 5, 4])   // -1
 * pearsonCorrelation([1, 2, 3], [3, 3, 3])   // NaN  (zero variance in ys)
 *
 * @description
 * **Insights** — Pearson r is the square-root of R² for simple linear
 * regression and directly quantifies linear association strength. Use it to:
 * - Pre-screen variables before running regression.
 * - Classify relationship strength (|r| ≥ 0.7 strong, 0.4–0.7 moderate,
 *   < 0.4 weak) for `@statili/forge` insight generation.
 * - Surface pairwise correlations in heatmap / scatterplot matrix views.
 */
export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n !== ys.length || n < 2) return NaN;
  const sdX = standardDeviation(xs);
  const sdY = standardDeviation(ys);
  if (sdX === 0 || sdY === 0) return NaN;
  return covariance(xs, ys) / (sdX * sdY);
}
