import React from "react";
import type { RegressionResult } from "@statili/stats";

export interface StatsPanelProps {
  result: RegressionResult;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  width: 220,
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
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const color =
    value >= 0.7 ? "#22c55e" : value >= 0.3 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ padding: "0 14px 10px" }}>
      <div
        style={{
          height: 4,
          background: "#f3f4f6",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the raw `RegressionResult` from `@statili/stats` as a compact
 * stats card — showing method, slope, intercept, R², RMSE, n, and the
 * formatted equation string. Errors are rendered as a distinct red card.
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

  const { method, slope, intercept, r2, rmse, n } = result;

  const sign = intercept < 0 ? "−" : "+";
  const equation = `y = ${slope}x ${sign} ${Math.abs(intercept)}`;

  const rows: [string, string | number][] = [
    ["Slope", slope],
    ["Intercept", intercept],
    ["R²", r2],
    ["RMSE", rmse],
    ["n", n],
  ];

  return (
    <div style={card}>
      <div style={header}>
        <span>Stats Result</span>
        <span style={methodBadge}>{method}</span>
      </div>

      <table style={table}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={tdLabel}>{label}</td>
              <td style={tdValue}>
                {typeof value === "number"
                  ? Number.isInteger(value)
                    ? value
                    : value.toFixed(4)
                  : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <R2Bar value={r2} />

      <div style={equationBox}>{equation}</div>
    </div>
  );
}
