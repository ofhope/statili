## `@statili`: Robust & Type-Safe Statistical Algorithms for Data Visualization

**`@statili` is a collection of robust, type-safe statistical algorithms built in TypeScript, engineered for numerical stability and high-performance. Designed with a functional, data-last API and rich error handling, it provides the precise foundations for deriving actionable insights in modern web applications.**

-----

### 🌟 Core Purpose

In the world of data visualization, reliable and accurate statistical insights are paramount. `@statili` aims to bridge the gap between complex statistical methods and their robust, production-ready implementation in a TypeScript environment. It's built from the ground up to be the trusted statistical engine for deriving meaningful information from your data, specifically tailored for integration into interactive charts and analytical dashboards.

### ✨ Key Features & Highlights

  * **TypeScript & Type Safety:** Leverage the full power of TypeScript to ensure robust, predictable, and maintainable statistical computations with excellent Intellisense support.
  * **Numerical Stability & Robustness:** Algorithms are meticulously implemented and extensively tested against a wide variety of inputs and known statistical benchmarks to ensure accuracy and handle edge cases gracefully.
  * **Functional API Design:** Methods are designed to be composable and curry-friendly, promoting a clean, declarative coding style for data transformation and analysis.
  * **Comprehensive Error Handling:** Utilizes explicit [Discriminated Unions](https://www.google.com/search?q=%23error-handling) for results and errors, providing rich context on computation failures (e.g., `InsufficientData`, `VerticalLine`), enabling intelligent downstream handling by consuming applications like `InsightForge`.
  * **Detailed Documentation:** Every function, type, and interface is meticulously documented with clear DocBlocks, ensuring a smooth developer experience and deep understanding of the API.
  * **Performance Focus:** While primarily TypeScript, the architecture is designed with performance in mind, identifying potential bottlenecks and laying the groundwork for seamless integration with high-performance Rust via WebAssembly (WASM) where computationally intensive statistical components are required.
  * **Designed for Data Visualization:** Provides the precise statistical outputs needed to power dynamic charts, trend lines, anomaly highlighting, and other visual insights.

### 📦 Installation

`@statili` is structured as a monorepo containing multiple scoped packages. You can install specific statistical modules as needed:

```bash
npm install @statili/regression
# npm install @statili/timeseries
# npm install @statili/descriptive
```

### 🚀 Usage (Quick Start)

Here's a quick example demonstrating how to use `linearRegression` from `@statili/regression` and handle its results:

```typescript
import { linearRegression, type LinearRegressionResult } from '@statili/regression';

// Example 1: Successful regression
const data1 = [[1, 2], [2, 4], [3, 6], [4, 8]]; // Perfect linear data
const result1: LinearRegressionResult = linearRegression(data1);

if (!result1.ok) {
    console.error(`Error: ${result1.message} (${result1.errorType})`);
}

console.log(`Regression successful!`);
console.log(`Slope (m): ${result1.m}`);
console.log(`Y-intercept (b): ${result1.b}`);
if (result1.rSquared !== undefined) {
    console.log(`R-squared: ${result1.rSquared}`);
}

// Example 2: Insufficient data (error case)
const data2 = [[5, 10]]; // Only one point
const result2: LinearRegressionResult = linearRegression(data2);

if (!result2.ok) {
    // Output: "Regression failed: Linear regression requires at least two points. (InsufficientData)"
    console.log("This should not happen for single point data.");
    console.error(`Regression failed: ${result2.message} (${result2.errorType})`);
}

// Example 3: Vertical line (mathematically undefined slope)
const data3 = [[1, 1], [1, 2], [1, 3]]; // All X values are identical
const result3: LinearRegressionResult = linearRegression(data3);

if (!result3.ok) {
    // Output: "Regression failed: Cannot perform linear regression on a vertical line (all X values are identical). (VerticalLine)"
    console.log("This should not happen for vertical line data.");
    console.error(`Regression failed: ${result3.message} (${result3.errorType})`);
}
```

### 🛠️ Monorepo Structure

`@statili` is managed as a monorepo, allowing for shared tooling, consistent development practices, and easy cross-package integration. Each statistical domain (e.g., `regression`, `timeseries`) resides in its own workspace within the repository.

### 🚦 Error Handling

`@statili` adopts a robust error handling strategy:

  * **Throwing Errors:** For clear runtime invariants or developer misuse of the API (e.g., passing `null` where a number is strictly expected).
  * **Returning `NaN`:** For mathematically undefined or degenerate numerical results (e.g., a standard deviation of a single point, where the value is indeterminate but the computation itself didn't "fail" due to bad input).
  * **Discriminated Unions (for `Result` types):** For providing rich, contextual information about why a statistical computation could not yield a complete numerical result, enabling consuming applications like `InsightForge` to generate user-friendly messages.

<!-- end list -->

```typescript
// Example Discriminated Union for Results and Errors
type ResultSuccess<T> = {
    ok: true;
    value: T; // The actual successful result (e.g., { m, b, rSquared })
};

type ResultError = {
    ok: false;
    errorType: "InsufficientData" | "VerticalLine" | "InvalidInput" | "DegenerateCase" | string; // Specific failure types
    message: string; // Verbose reasoning for the failure
    details?: any; // Optional: additional technical details for debugging
};

type Result<T> = ResultSuccess<T> | ResultError;
```

### 🤝 Contributing

We welcome contributions\! If you have ideas for new algorithms, improvements to existing ones, or find a bug, please feel free to open an issue or submit a pull request. We strive for a collaborative and robust development process.

### 🔗 Ecosystem Integration

`@statili` is designed to be the foundational statistical engine for higher-level insight generation tools, such as the planned **InsightForge** package, which aims to interpret `statili`'s outputs into user-friendly narratives and visual annotations.

### 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).