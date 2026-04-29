/**
 * Sigmoid (logistic) activation function: **σ(z) = 1 / (1 + e⁻ᶻ)**.
 *
 * Maps any real-valued input to the open interval `(0, 1)`, making it
 * suitable for modelling probabilities. The function is smooth and
 * differentiable everywhere, which is why it is used in gradient-based
 * optimisation (e.g. logistic regression, neural networks).
 *
 * **Key properties:**
 * - `σ(0)  = 0.5`
 * - `σ(z) → 1` as `z → +∞`
 * - `σ(z) → 0` as `z → −∞`
 * - `σ'(z) = σ(z) · (1 − σ(z))` (gradient used in back-propagation)
 *
 * @param z - Any real number (the linear predictor / logit).
 * @returns A probability in the open interval `(0, 1)`.
 *
 * @example
 * sigmoid(0)    // 0.5
 * sigmoid(2)    // ≈ 0.8808
 * sigmoid(-2)   // ≈ 0.1192
 * sigmoid(100)  // ≈ 1  (numerically saturates to 1)
 *
 * @description
 * **Usage in `@statili/stats`** — the logistic regression implementation
 * applies `sigmoid` to the linear predictor `b₀ + b₁x₁ + … + bₖxₖ` to
 * obtain the estimated class probability `P(y=1 | x)`.
 *
 * **Insights derivable by `@statili/forge`** — the logit (inverse sigmoid)
 * of a predicted probability reveals the log-odds: positive logit means the
 * model favours class 1; negative means class 0.
 */
export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}
