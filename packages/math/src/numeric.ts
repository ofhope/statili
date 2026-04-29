/**
 * Rounds a number to a given decimal precision using the `10^precision` factor
 * strategy. Handles edge-cases where `precision` is undefined, null, or
 * non-finite by returning the raw value unchanged.
 *
 * **Partial-application pattern** — `precision` is the infrequently-changing
 * "config" argument, so it sits first, making it easy to create specialised
 * rounding helpers:
 *
 * @param precision - Number of decimal places to round to (e.g. `2` → `1.235`
 *   rounds to `1.24`). Pass `0` for integer rounding.
 * @param value - The number to round.
 * @returns The rounded number, or `value` unchanged when `precision` is not a
 *   finite number.
 *
 * @example
 * round(2, 1.2345)  // 1.23
 * round(0, 3.7)     // 4
 *
 * // Partial application
 * const toCents = round(2);
 * toCents(19.999)   // 20
 */
export function round(precision: number, value: number): number {
  if (precision === undefined || precision === null || !Number.isFinite(precision)) return value;
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/**
 * Returns `true` when `value` is a finite, non-NaN number (i.e., safe for
 * arithmetic). Rejects `NaN`, `Infinity`, `-Infinity`, `null`, and `undefined`.
 *
 * Replaces the inline `isValid` guard scattered across `@statili/stats`
 * regression methods.
 *
 * @param value - Any value to test.
 * @returns `true` if `value` is a finite number, `false` otherwise.
 *
 * @example
 * isFiniteNumber(3.14)      // true
 * isFiniteNumber(NaN)       // false
 * isFiniteNumber(Infinity)  // false
 * isFiniteNumber(null)      // false
 */
export function isFiniteNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Clamps `value` to the closed interval `[lo, hi]`.
 *
 * Useful when mapping statistical outputs (e.g. probabilities, normalised
 * scores) to a bounded domain before rendering.
 *
 * @param lo  - Lower bound (inclusive).
 * @param hi  - Upper bound (inclusive).
 * @param value - The value to clamp.
 * @returns `lo` if `value < lo`, `hi` if `value > hi`, otherwise `value`.
 *
 * @example
 * clamp(0, 1, -0.3)  // 0
 * clamp(0, 1, 1.7)   // 1
 * clamp(0, 1, 0.5)   // 0.5
 *
 * // Partial application — create a unit-clamp helper
 * const unitClamp = clamp(0, 1);
 * unitClamp(sigmoid(-100))  // 0 (not quite, but clamped to 0)
 */
export function clamp(lo: number, hi: number, value: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/**
 * Linearly interpolates between `a` and `b` by factor `t`.
 *
 * - `t = 0` returns `a`
 * - `t = 1` returns `b`
 * - `t = 0.5` returns the midpoint
 * - Values outside `[0, 1]` extrapolate beyond the endpoints
 *
 * Handy for generating evenly-spaced prediction points along a regression
 * curve or animating transitions between two chart states.
 *
 * @param a - Start value.
 * @param b - End value.
 * @param t - Interpolation factor (typically `[0, 1]`).
 * @returns `a + (b - a) * t`
 *
 * @example
 * lerp(0, 10, 0.5)   // 5
 * lerp(2, 8, 0.25)   // 3.5
 * lerp(0, 100, 1.1)  // 110  (extrapolation)
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
