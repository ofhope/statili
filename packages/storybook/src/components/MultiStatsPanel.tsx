import React from "react";
import type { MultiRegressionResult } from "@statili/stats";

export interface MultiStatsPanelProps {
  result: MultiRegressionResult;
  featureNames?: string[];
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  width: 280,
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

const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" as const };

const tdLabel: React.CSSProperties = {
  padding: "6px 14px",
  color: "#6b7280",
  fontWeight: 500,
  borderBottom: "1px solid #f3f4f6",
  whiteSpace: "nowrap" as const,
};

const tdValue: React.CSSProperties = {
  padding: "6px 14px",
  color: "#111827",
  fontWeight: 600,
  borderBottom: "1px solid #f3f4f6",
  textAlign: "right" as const,
  fontVariantNumeric: "tabular-nums",
};

const sectionHeader: React.CSSProperties = {
  padding: "8px 14px 4px",
  background: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
  fontSize: 11,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const coeffRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 14px",
  borderBottom: "1px solid #f9fafb",
};

const coeffName: React.CSSProperties = {
  color: "#374151",
  fontWeight: 500,
};

const coeffValue: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: 12,
  fontWeight: 600,
  color: "#111827",
};

const directionTag = (val: number): React.CSSProperties => ({
  display: "inline-block",
  fontSize: 10,
  padding: "1px 5px",
  borderRadius: 3,
  marginLeft: 6,
  background: val > 0 ? "#dcfce7" : val < 0 ? "#fee2e2" : "#f3f4f6",
  color: val > 0 ? "#166534" : val < 0 ? "#991b1b" : "#6b7280",
  fontWeight: 600,
});

const equationBox: React.CSSProperties = {
  padding: "10px 14px",
  background: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
  fontFamily: "ui-monospace, monospace",
  fontSize: 11,
  color: "#374151",
  wordBreak: "break-word" as const,
};

const accuracyBar: React.CSSProperties = {
  padding: "6px 14px 10px",
};

const errorCard: React.CSSProperties = { ...card, borderColor: "#fecaca" };
const errorHeader: React.CSSProperties = {
  ...header,
  background: "#fef2f2",
  borderBottomColor: "#fecaca",
  color: "#dc2626",
};
const errorTypeBadge: React.CSSProperties = {
  fontSize: 11, fontWeight: 600,
  background: "#fee2e2", color: "#b91c1c",
  padding: "2px 7px", borderRadius: 4,
  fontFamily: "ui-monospace, monospace",
};
const errorMessage: React.CSSProperties = {
  padding: "12px 14px", color: "#374151", lineHeight: 1.5, fontSize: 12,
};

// ─── Accuracy bar (logistic) ──────────────────────────────────────────────────

function AccuracyBar({ value }: { value: number }) {
  const pct   = Math.max(0, Math.min(1, value)) * 100;
  const color = value >= 0.9 ? "#22c55e" : value >= 0.7 ? "#f59e0b" : "#ef4444";
  return (
    <div style={accuracyBar}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#6b7280" }}>
        <span>Accuracy</span>
        <span style={{ fontWeight: 600, color: "#111827" }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the raw `MultiRegressionResult` from `@statili/stats` (`multilinear` or `logistic`).
 *
 * Displays:
 * - Core metrics (R², RMSE, n, numFeatures)
 * - Per-coefficient breakdown with ↑/↓ direction badge
 * - Accuracy bar for logistic results
 * - Full equation string
 */
export function MultiStatsPanel({ result, featureNames = [] }: MultiStatsPanelProps) {
  if (!result.ok) {
    return (
      <div style={errorCard}>
        <div style={errorHeader}><span>Computation Failed</span></div>
        <div style={{ padding: "10px 14px 4px" }}>
          <span style={errorTypeBadge}>{result.errorType}</span>
        </div>
        <p style={errorMessage}>{result.message}</p>
      </div>
    );
  }

  const { method, coefficients, numFeatures, r2, rmse, n, equation, accuracy } = result;
  const isLogistic   = method === "logistic";
  const r2Label      = isLogistic ? "Pseudo-R² (McFadden)" : "R²";

  const topRows: [string, string | number][] = [
    [r2Label, isNaN(r2) ? "N/A" : r2],
    ...(!isLogistic ? [["RMSE", rmse] as [string, number]] : []),
    ["n", n],
    ["Features", numFeatures],
  ];

  const featureLabel = (i: number) =>
    featureNames[i] ?? `x${i + 1}`;

  return (
    <div style={card}>
      <div style={header}>
        <span>Stats Result</span>
        <span style={methodBadge}>{method}</span>
      </div>

      {/* Core metrics */}
      <table style={table}>
        <tbody>
          {topRows.map(([label, value]) => (
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

      {/* Accuracy bar for logistic */}
      {isLogistic && accuracy !== undefined && !isNaN(accuracy) && (
        <AccuracyBar value={accuracy} />
      )}

      {/* Coefficient breakdown */}
      <div style={sectionHeader}>Coefficients</div>

      <div style={{ paddingBottom: 4 }}>
        {coefficients.map((coeff, i) => {
          const label = i === 0 ? "Intercept (b₀)" : `${featureLabel(i - 1)} (b${i})`;
          return (
            <div key={i} style={coeffRow}>
              <span style={coeffName}>{label}</span>
              <span>
                <code style={coeffValue}>{coeff}</code>
                {i > 0 && (
                  <span style={directionTag(coeff)}>
                    {coeff > 0 ? "↑" : coeff < 0 ? "↓" : "—"}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div style={equationBox}>{equation}</div>
    </div>
  );
}
