import React from "react";
import type { RegressionResult } from "@statili/stats";

export interface StatsPanelProps {
  result: RegressionResult;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  width: 240,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  overflow: "hidden",
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 13,
};

const header: React.CSSProperties = {
  padding: "10px 14px",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
  color: "#111827",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const methodBadge: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "2px 7px",
  borderRadius: 4,
  letterSpacing: "0.02em",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const tdLabel: React.CSSProperties = {
  padding: "7px 14px",
  color: "#6b7280",
  fontWeight: 500,
  borderBottom: "1px solid #f3f4f6",
  whiteSpace: "nowrap" as const,
};

const tdValue: React.CSSProperties = {
  padding: "7px 14px",
  color: "#111827",
  fontWeight: 600,
  borderBottom: "1px solid #f3f4f6",
  textAlign: "right" as const,
  fontVariantNumeric: "tabular-nums",
};

const equationBox: React.CSSProperties = {
  padding: "10px 14px",
  background: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
  fontFamily: "ui-monospace, monospace",
  fontSize: 12,
  color: "#374151",
  wordBreak: "break-word" as const,
};

const coeffBox: React.CSSProperties = {
  padding: "8px 14px 12px",
  borderTop: "1px solid #e5e7eb",
};

const coeffLabel: React.CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 500,
  marginBottom: 6,
};

const coeffChip: React.CSSProperties = {
  display: "inline-block",
  background: "#f3f4f6",
  color: "#374151",
  fontFamily: "ui-monospace, monospace",
  fontSize: 11,
  padding: "2px 7px",
  borderRadius: 4,
  margin: "2px 3px 2px 0",
};

const errorCard: React.CSSProperties = {
  ...card,
  borderColor: "#fecaca",
};

const errorHeader: React.CSSProperties = {
  ...header,
  background: "#fef2f2",
  borderBottomColor: "#fecaca",
  color: "#dc2626",
};

const errorTypeBadge: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "2px 7px",
  borderRadius: 4,
  fontFamily: "ui-monospace, monospace",
};

const errorMessage: React.CSSProperties = {
  padding: "12px 14px",
  color: "#374151",
  lineHeight: 1.5,
  fontSize: 12,
};

// ─── R² bar ───────────────────────────────────────────────────────────────────

function R2Bar({ value }: { value: number }) {
  const pct   = Math.max(0, Math.min(1, value)) * 100;
  const color = value >= 0.7 ? "#22c55e" : value >= 0.3 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ padding: "0 14px 10px" }}>
      <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

// ─── Equation formatter ───────────────────────────────────────────────────────

function formatEquation(result: Extract<RegressionResult, { ok: true }>): string {
  if (result.equation) return result.equation;

  const { method, slope, intercept } = result;

  if (method === "linear") {
    const sign = intercept < 0 ? "−" : "+";
    return `y = ${slope}x ${sign} ${Math.abs(intercept)}`;
  }
  if (method === "power") {
    return `y = ${intercept}x^${slope}`;
  }
  if (method === "logarithmic") {
    const sign = slope < 0 ? "−" : "+";
    return `y = ${intercept} ${sign} ${Math.abs(slope)}·ln(x)`;
  }
  if (method === "exponential") {
    return `y = ${intercept}e^(${slope}x)`;
  }
  return `slope: ${slope}, intercept: ${intercept}`;
}

// ─── Method-specific row builder ──────────────────────────────────────────────

function buildRows(result: Extract<RegressionResult, { ok: true }>): [string, string | number][] {
  const { method, r2, rmse, n } = result;
  const commonTail: [string, string | number][] = [
    ["R²", r2],
    ["RMSE", rmse],
    ["n", n],
  ];

  if (method === "polynomial") {
    return [
      ["Degree", result.degree ?? "—"],
      ...commonTail,
    ];
  }
  if (method === "power") {
    return [
      ["Scale (a)", result.intercept],
      ["Exponent (b)", result.slope],
      ...commonTail,
    ];
  }
  if (method === "logarithmic") {
    return [
      ["Constant (a)", result.intercept],
      ["ln Coeff (b)", result.slope],
      ...commonTail,
    ];
  }
  if (method === "exponential") {
    return [
      ["Scale (a)", result.intercept],
      ["Growth (b)", result.slope],
      ...commonTail,
    ];
  }
  // Default: linear
  return [
    ["Slope", result.slope],
    ["Intercept", result.intercept],
    ...commonTail,
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the raw `RegressionResult` from `@statili/stats` as a compact stats card.
 * Adapts its row layout based on `result.method` — displaying degree for polynomial,
 * scale+exponent for power, etc.
 */
export function StatsPanel({ result }: StatsPanelProps) {
  if (!result.ok) {
    return (
      <div style={errorCard}>
        <div style={errorHeader}>
          <span>Computation Failed</span>
        </div>
        <div style={{ padding: "10px 14px 4px" }}>
          <span style={errorTypeBadge}>{result.errorType}</span>
        </div>
        <p style={errorMessage}>{result.message}</p>
      </div>
    );
  }

  const rows     = buildRows(result);
  const equation = formatEquation(result);

  return (
    <div style={card}>
      <div style={header}>
        <span>Stats Result</span>
        <span style={methodBadge}>{result.method}</span>
      </div>

      <table style={table}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={tdLabel}>{label}</td>
              <td style={tdValue}>
                {typeof value === "number"
                  ? Number.isInteger(value) ? value : value.toFixed(4)
                  : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <R2Bar value={result.r2} />

      {/* Polynomial: show full coefficients vector */}
      {result.method === "polynomial" && result.coefficients && (
        <div style={coeffBox}>
          <div style={coeffLabel}>Coefficients (c₀ → cₙ)</div>
          {result.coefficients.map((c, i) => (
            <code key={i} style={coeffChip}>c{i}={c}</code>
          ))}
        </div>
      )}

      <div style={equationBox}>{equation}</div>
    </div>
  );
}
