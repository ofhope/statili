
// Recursive type to get the return type of the last function
type PipeReturn<F extends readonly unknown[]> = F extends readonly [
  ...any[],
  (...args: any[]) => infer R
]
  ? R
  : never;

// Type to get the input type of the first function  
type PipeInput<F extends readonly unknown[]> = F extends readonly [
  (arg: infer A) => any,
  ...any[]
]
  ? A
  : never;

// Function overloads for better IntelliSense and type checking
export function pipe<A, B>(f1: (input: A) => B): (input: A) => B;
export function pipe<A, B, C>(
  f1: (input: A) => B,
  f2: (input: B) => C
): (input: A) => C;
export function pipe<A, B, C, D>(
  f1: (input: A) => B,
  f2: (input: B) => C,
  f3: (input: C) => D
): (input: A) => D;
export function pipe<A, B, C, D, E>(
  f1: (input: A) => B,
  f2: (input: B) => C,
  f3: (input: C) => D,
  f4: (input: D) => E
): (input: A) => E;
export function pipe<A, B, C, D, E, F>(
  f1: (input: A) => B,
  f2: (input: B) => C,
  f3: (input: C) => D,
  f4: (input: D) => E,
  f5: (input: E) => F
): (input: A) => F;
export function pipe<A, B, C, D, E, F, G>(
  f1: (input: A) => B,
  f2: (input: B) => C,
  f3: (input: C) => D,
  f4: (input: D) => E,
  f5: (input: E) => F,
  f6: (input: F) => G
): (input: A) => G;
export function pipe<A, B, C, D, E, F, G, H>(
  f1: (input: A) => B,
  f2: (input: B) => C,
  f3: (input: C) => D,
  f4: (input: D) => E,
  f5: (input: E) => F,
  f6: (input: F) => G,
  f7: (input: G) => H
): (input: A) => H;
// Fallback for longer chains - still typed but less precise
export function pipe<F extends readonly [(...args: any[]) => any, ...Array<(arg: any) => any>]>(
  ...fns: F
): (input: PipeInput<F>) => PipeReturn<F>;

/**
 * @function pipe
 * @description A utility function that composes a series of functions, executing them from left to right.
 * The output of one function becomes the input of the next. This creates a pipeline
 * for data transformation, enhancing readability and composability.
 *
 * @template F A tuple of functions to be piped.
 * @param {...F} fns A variable number of functions to be composed.
 * @returns {function(PipeInput<F>): PipeReturn<F>} A new function that takes an initial value and pipes it through the composed functions,
 * returning the final result.
 *
 * @example
 * // A simple pipeline to process an array of numbers
 * const data = [1, 2, 3, 4, 5];
 *
 * const addOne = (arr: number[]) => arr.map(x => x + 1);
 * const multiplyByTwo = (arr: number[]) => arr.map(x => x * 2);
 * const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);
 *
 * // Create a composed function
 * const processData = pipe(addOne, multiplyByTwo, sum);
 *
 * // Execute the pipeline
 * const result = processData(data); // Returns 36
 *
 * @doc-summary Composes functions from left to right for a data transformation pipeline.
 * @doc-usecase Ideal for statistical pipelines where data needs to be cleaned, transformed, and then analyzed
 * in a series of distinct steps. For example, a pipeline could be `pipe(normalizeData, removeOutliers, calculateMean)`.
 * It's also useful for creating composite statistical methods for `@statili/forge` where the output of
 * one function (e.g., `zScoreOutlier`) is processed by another before being passed to the visualization layer.
 * @doc-insights Promotes a functional, declarative style of programming, making complex data flows more explicit and easier to reason about.
 * It's a fundamental building block for creating reusable and highly composable statistical algorithms.
 */
export function pipe(...fns: any[]) {
  return (input: any) => {
    let result = input;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
}