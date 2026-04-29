import type { DataPoint, MultiDataPoint } from "@statili/stats";

export type DatasetKey =
  | "strong_positive" | "perfect_positive" | "negative" | "flat"
  | "weak_scattered" | "with_outlier" | "nonlinear"
  | "error_vertical" | "error_insufficient"
  | "quadratic_up" | "quadratic_down" | "cubic" | "poly_overfitted"
  | "power_superlinear" | "power_diminishing" | "power_inverse"
  | "log_growth" | "log_decay";

export interface Dataset {
  label: string;
  description: string;
  data: DataPoint[];
}

export const DATASETS: Record<DatasetKey, Dataset> = {
  strong_positive: {
    label: "Strong Positive Trend",
    description: "20 points with a clear positive trend and light scatter (R2 ~0.99)",
    data: [
      [1,4.1],[2,4.8],[3,8.2],[4,9.1],[5,10.4],
      [6,11.9],[7,16.2],[8,15.8],[9,20.1],[10,19.7],
      [11,23.8],[12,24.1],[13,27.6],[14,28.9],[15,32.1],
      [16,31.8],[17,35.4],[18,37.9],[19,39.1],[20,42.4],
    ],
  },
  perfect_positive: {
    label: "Perfect Fit",
    description: "y = 2x + 1 — all points on the line, R2 = 1, RMSE = 0",
    data: Array.from({ length: 10 }, (_, i) => [i + 1, 2 * (i + 1) + 1] as DataPoint),
  },
  negative: {
    label: "Negative Trend",
    description: "Negative slope with moderate scatter",
    data: [
      [1,19.8],[2,17.9],[3,17.1],[4,14.8],[5,14.2],
      [6,11.7],[7,11.0],[8,8.4],[9,7.8],[10,5.9],
      [11,5.1],[12,3.2],[13,2.8],[14,0.9],[15,0.1],
    ],
  },
  flat: {
    label: "Flat / No Trend",
    description: "Slope ~0 — Y is constant regardless of X",
    data: [
      [1,5.1],[2,4.9],[3,5.2],[4,4.8],[5,5.0],
      [6,5.3],[7,4.7],[8,5.1],[9,5.0],[10,4.9],
      [11,5.2],[12,4.8],[13,5.1],[14,4.9],[15,5.0],
    ],
  },
  weak_scattered: {
    label: "Weak / Scattered",
    description: "Low R2 — a linear model is a poor fit",
    data: [
      [1,8.0],[2,2.1],[3,9.3],[4,4.4],[5,12.1],
      [6,1.2],[7,15.3],[8,3.1],[9,7.4],[10,11.2],
      [11,5.0],[12,14.1],[13,2.3],[14,9.2],[15,6.4],
    ],
  },
  with_outlier: {
    label: "Outlier Present",
    description: "Strong trend with one clear outlier at x=7",
    data: [
      [1,2.1],[2,4.3],[3,5.9],[4,8.1],[5,10.2],
      [6,11.8],[7,28.5],[8,16.1],[9,17.9],[10,20.3],
      [11,22.1],[12,24.2],[13,25.8],[14,28.1],[15,30.2],
    ],
  },
  nonlinear: {
    label: "Non-linear (Quadratic)",
    description: "y ~0.3x^2 — linear model breaks down on curved data",
    data: [
      [1,0.3],[2,1.4],[3,2.6],[4,4.9],[5,7.3],
      [6,10.7],[7,14.8],[8,19.1],[9,24.6],[10,30.3],
      [11,36.7],[12,43.1],
    ],
  },
  error_vertical: {
    label: "Error: Vertical Line",
    description: "All X values are identical — triggers DegenerateInput",
    data: [[5,1],[5,4],[5,7],[5,10],[5,14]],
  },
  error_insufficient: {
    label: "Error: Insufficient Data",
    description: "Only 1 data point — triggers InsufficientData",
    data: [[3,7]],
  },

  // Polynomial
  quadratic_up: {
    label: "Quadratic — Upward Parabola",
    description: "y ~0.4x^2 - 3x + 5 — opens upward, minimum around x=3.75",
    data: [
      [0,5.1],[1,2.5],[2,0.8],[3,0.2],[4,0.5],
      [5,1.8],[6,4.4],[7,7.9],[8,12.6],[9,18.4],
      [10,25.0],[11,32.7],[12,41.3],
    ],
  },
  quadratic_down: {
    label: "Quadratic — Downward Parabola",
    description: "y ~-0.5x^2 + 5x - 1 — opens downward, peak around x=5",
    data: [
      [0,-1.1],[1,3.3],[2,6.8],[3,9.4],[4,11.1],
      [5,11.6],[6,10.8],[7,9.3],[8,6.9],[9,3.4],
      [10,-1.3],[11,-7.1],[12,-14.2],
    ],
  },
  cubic: {
    label: "Cubic — S-Curve",
    description: "y ~0.1x^3 - 1.5x^2 + 6x — inflection point, changes curvature direction",
    data: [
      [0,0.2],[1,4.7],[2,7.8],[3,9.4],[4,9.4],
      [5,7.7],[6,4.6],[7,0.7],[8,-4.4],[9,-10.8],
      [10,-18.3],[11,-27.1],[12,-37.4],
    ],
  },
  poly_overfitted: {
    label: "Polynomial — Overfit Risk",
    description: "Only 5 points — fitting a degree-4 polynomial leaves 0 degrees of freedom",
    data: [[1,2.1],[2,5.8],[3,4.2],[4,9.7],[5,7.3]],
  },

  // Power law
  power_superlinear: {
    label: "Power Law — Super-linear (b ~1.8)",
    description: "y ~2x^1.8 — accelerating growth, doubling X multiplies Y by ~3.5",
    data: [
      [1,2.1],[2,6.8],[3,14.2],[4,24.9],[5,38.7],
      [6,55.3],[7,74.9],[8,97.6],[9,123.2],[10,151.8],
      [12,217.4],[15,338.1],[20,586.2],
    ],
  },
  power_diminishing: {
    label: "Power Law — Diminishing Returns (b ~0.45)",
    description: "y ~10x^0.45 — sub-linear growth, classic diminishing returns",
    data: [
      [1,10.1],[2,13.8],[4,19.4],[6,23.7],[8,27.3],
      [10,30.4],[15,36.8],[20,42.1],[30,51.4],[40,58.6],
      [50,64.9],[75,77.2],[100,87.3],
    ],
  },
  power_inverse: {
    label: "Power Law — Inverse (b ~-1)",
    description: "y ~100x^-1 — Y decreases proportionally as X increases",
    data: [
      [1,100.2],[2,49.8],[4,25.1],[5,20.3],[8,12.4],
      [10,9.9],[20,5.1],[25,3.9],[40,2.5],[50,2.1],
    ],
  },

  // Logarithmic
  log_growth: {
    label: "Logarithmic Growth — Diminishing Returns",
    description: "y ~5*ln(x) — rapid early growth that levels off",
    data: [
      [1,0.1],[2,3.4],[3,5.4],[4,7.0],[5,8.1],
      [6,9.0],[8,10.4],[10,11.6],[15,13.5],[20,15.1],
      [30,17.0],[50,19.6],[75,21.5],[100,23.1],
    ],
  },
  log_decay: {
    label: "Logarithmic Decay — Levelling Off",
    description: "y ~30 - 4*ln(x) — rapid early decrease that stabilises",
    data: [
      [1,30.1],[2,27.1],[3,25.6],[4,24.4],[5,23.6],
      [6,23.0],[8,21.7],[10,20.8],[15,19.4],[20,18.3],
      [30,16.9],[50,15.1],[75,13.7],[100,12.6],
    ],
  },
};

// ── Multi-feature datasets ────────────────────────────────────────────────────

export type MultiDatasetKey =
  | "house_prices" | "student_scores" | "multi_error_insufficient"
  | "logistic_pass_fail" | "logistic_purchase" | "logistic_error_single_class";

export interface MultiDataset {
  label: string;
  description: string;
  data: MultiDataPoint[];
  featureNames: string[];
  targetName: string;
}

export const MULTI_DATASETS: Record<MultiDatasetKey, MultiDataset> = {
  house_prices: {
    label: "House Price Prediction (2 features)",
    description: "Predict price (k) from floor area (m2) and bedroom count.",
    featureNames: ["Floor Area (m2)", "Bedrooms"],
    targetName: "Price (k)",
    data: [
      {x:[50,1],y:110},{x:[65,1],y:128},{x:[72,2],y:148},
      {x:[85,2],y:172},{x:[90,2],y:178},{x:[100,3],y:205},
      {x:[110,3],y:220},{x:[120,3],y:238},{x:[130,4],y:262},
      {x:[140,4],y:280},{x:[155,4],y:304},{x:[170,5],y:338},
      {x:[185,5],y:362},{x:[200,5],y:388},{x:[220,6],y:430},
    ],
  },
  student_scores: {
    label: "Student Exam Scores (3 features)",
    description: "Predict exam score (%) from study hours, sleep hours, and practice problems.",
    featureNames: ["Study Hours", "Sleep Hours", "Practice Problems"],
    targetName: "Exam Score (%)",
    data: [
      {x:[2,5,10],y:48},{x:[3,6,15],y:54},{x:[4,6,20],y:61},
      {x:[4,7,25],y:65},{x:[5,7,30],y:70},{x:[5,8,35],y:74},
      {x:[6,7,40],y:76},{x:[6,8,45],y:80},{x:[7,8,50],y:84},
      {x:[7,9,55],y:87},{x:[8,8,60],y:89},{x:[8,9,65],y:92},
      {x:[9,9,70],y:94},{x:[9,8,75],y:93},{x:[10,9,80],y:97},
    ],
  },
  multi_error_insufficient: {
    label: "Error: Insufficient Data",
    description: "Only 2 observations for a 3-feature model — needs at least 4.",
    featureNames: ["x1","x2","x3"],
    targetName: "y",
    data: [{x:[1,2,3],y:10},{x:[4,5,6],y:20}],
  },
  logistic_pass_fail: {
    label: "Pass / Fail Classification (2 features)",
    description: "Binary outcome (1=pass, 0=fail) from study hours and practice problems.",
    featureNames: ["Study Hours","Practice Problems"],
    targetName: "Pass (1) / Fail (0)",
    data: [
      {x:[1,5],y:0},{x:[1,8],y:0},{x:[2,10],y:0},
      {x:[2,12],y:0},{x:[3,15],y:0},{x:[3,18],y:1},
      {x:[4,20],y:1},{x:[4,22],y:0},{x:[5,25],y:1},
      {x:[5,28],y:1},{x:[6,30],y:1},{x:[6,32],y:1},
      {x:[7,35],y:1},{x:[7,38],y:1},{x:[8,40],y:1},
      {x:[8,42],y:1},{x:[9,45],y:1},{x:[10,50],y:1},
    ],
  },
  logistic_purchase: {
    label: "Purchase Prediction (1 feature)",
    description: "Binary outcome (1=purchased, 0=not) from time-on-page (minutes).",
    featureNames: ["Time on Page (min)"],
    targetName: "Purchase (1=yes, 0=no)",
    data: [
      {x:[0.5],y:0},{x:[1.0],y:0},{x:[1.5],y:0},
      {x:[2.0],y:0},{x:[2.5],y:0},{x:[3.0],y:0},
      {x:[3.5],y:1},{x:[4.0],y:0},{x:[4.5],y:1},
      {x:[5.0],y:1},{x:[5.5],y:1},{x:[6.0],y:1},
      {x:[6.5],y:1},{x:[7.0],y:1},{x:[7.5],y:1},
    ],
  },
  logistic_error_single_class: {
    label: "Error: Single Class",
    description: "All observations have y=1 — logistic regression needs both classes.",
    featureNames: ["x1"],
    targetName: "y",
    data: [{x:[1],y:1},{x:[2],y:1},{x:[3],y:1},{x:[4],y:1},{x:[5],y:1}],
  },
};
