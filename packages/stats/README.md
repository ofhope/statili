# @statili/stats

Core statistical computations for the statili library. Provides linear regression and Z-score utilities with explicit error handling via discriminant unions.

## Install

```bash
npm install @statili/stats
```

## Usage

### Linear regression

```ts
import { linear } from '@statili/stats'

const result = linear([
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
])

if (result.type === 'success') {
  console.log(result.slope)      // 2
  console.log(result.intercept)  // 0
  console.log(result.r2)         // 1
  console.log(result.predict(4)) // { x: 4, y: 8 }
}
```

With options:

```ts
const result = linear(points, { precision: 4 })
```

### Z-scores

```ts
import { getZScoresForDataset } from '@statili/stats'

const scores = getZScoresForDataset([10, 20, 30, 40, 50])
```

## Result types

All functions return a discriminant union — check `result.type` before accessing fields:

```ts
type RegressionResult =
  | { type: 'success'; slope: number; intercept: number; r2: number; rmse: number; n: number; predict: (x: number) => PredictedPoint; /* ... */ }
  | { type: 'error'; errorType: 'InsufficientData' | 'DegenerateInput' | 'InvalidInput' | 'MathError' | 'NumericalStability'; message: string }
```

## License

MIT
