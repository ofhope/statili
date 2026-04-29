# @statili/fp

Functional programming utilities for composable, data-last pipelines. Used internally by statili packages and available standalone.

## Install

```bash
npm install @statili/fp
```

## API

### `curry`

Transforms a regular function into a curried version that supports partial application.

```ts
import { curry } from '@statili/fp'

const add = curry((a: number, b: number) => a + b)

add(1)(2)  // 3
add(1, 2)  // 3
```

### `pipe`

Left-to-right function composition. Returns a pipeline function with inferred types for up to 7 steps.

```ts
import { pipe } from '@statili/fp'

const process = pipe(
  (x: number) => x * 2,
  (x) => x + 1,
  (x) => `Result: ${x}`,
)

process(5) // "Result: 11"
```

### `compose`

Left-to-right composition using `reduce`. Useful for building reusable transforms.

```ts
import { compose } from '@statili/fp'

const transform = compose(double, addOne, toString)
```

## License

MIT
