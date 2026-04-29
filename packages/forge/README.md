# @statili/forge

Insight generation for linear regression results. Takes raw regression output from `@statili/stats` and produces structured, human-readable findings — trend descriptions, correlation strength classifications, and user-friendly error messages.

## Install

```bash
npm install @statili/forge
```

## Usage

```ts
import { linearRegressionInsights } from '@statili/forge'
import { linear } from '@statili/stats'

const regression = linear(points)

const result = linearRegressionInsights(regression)

if (result.type === 'success') {
  for (const insight of result.insights) {
    console.log(insight.summary)  // "Strong positive trend"
    console.log(insight.type)     // "finding" | "warning" | "no-finding" | "not-applicable"
  }
}
```

### With options

```ts
const result = linearRegressionInsights(regression, {
  r2Strong: 0.8,       // threshold for "strong" correlation (default: 0.7)
  r2Moderate: 0.5,     // threshold for "moderate" correlation (default: 0.5)
  minSampleSize: 10,   // warn below this n (default: 5)
})
```

## Insights generated

| Insight | Description |
|---|---|
| `regressionSummary` | Positive, negative, or flat trend with slope annotations for drawing trend lines |
| `correlationStrength` | Classifies R² as strong, moderate, or weak |
| `regressionError` | Translates stat errors (`InsufficientData`, `DegenerateInput`, etc.) to readable messages |

## Result types

```ts
type InsightResultSuccess = {
  type: 'success'
  insights: GeneratedInsight[]
}

type InsightResultError = {
  type: 'error'
  message: string
}
```

## License

MIT
