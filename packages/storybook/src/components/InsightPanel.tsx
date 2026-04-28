import React from "react";
import type {
  InsightResultSuccess,
  InsightResultError,
  GeneratedInsight,
} from "@statili/forge";

type InsightResult = InsightResultSuccess | InsightResultError;

export interface InsightPanelProps {
  result: InsightResult;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const panelBase: React.CSSProperties = {
  width: 280,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 13,
};

const insightCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  overflow: "hidden",
};

const insightCardHeader: React.CSSProperties = {
  padding: "7px 12px",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
};

const typeBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "ui-monospace, monospace",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "2px 7px",
  borderRadius: 4,
  letterSpacing: "0.02em",
};

const summaryText: React.CSSProperties = {
  padding: "10px 12px 12px",
  color: "#111827",
  lineHeight: 1.6,
  margin: 0,
};

const annotationsWrap: React.CSSProperties = {
  padding: "0 12px 10px",
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 4,
};

const annotationChip: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "ui-monospace, monospace",
  background: "#f3f4f6",
  color: "#6b7280",
  padding: "2px 6px",
  borderRadius: 4,
};

const errorCard: React.CSSProperties = {
  border: "1px solid #fecaca",
  borderRadius: 8,
  overflow: "hidden",
};

const errorCardHeader: React.CSSProperties = {
  padding: "10px 14px",
  background: "#fef2f2",
  borderBottom: "1px solid #fecaca",
  fontWeight: 600,
  color: "#dc2626",
  fontSize: 13,
};

const errorMessage: React.CSSProperties = {
  padding: "10px 14px 4px",
  color: "#111827",
  lineHeight: 1.5,
  margin: 0,
};

const helpTextBox: React.CSSProperties = {
  padding: "8px 14px 12px",
  color: "#6b7280",
  lineHeight: 1.5,
  margin: 0,
  borderTop: "1px solid #f3f4f6",
  marginTop: 8,
};

const originalErrorTypeBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "ui-monospace, monospace",
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "2px 7px",
  borderRadius: 4,
  margin: "4px 14px 10px",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: GeneratedInsight }) {
  const hasAnnotations =
    insight.annotations !== undefined && insight.annotations.length > 0;

  return (
    <div style={insightCard}>
      <div style={insightCardHeader}>
        <span style={typeBadge}>{insight.type}</span>
      </div>
      <p style={summaryText}>{insight.summary}</p>
      {hasAnnotations && (
        <div style={annotationsWrap}>
          {insight.annotations!.map((a, i) => (
            <code key={i} style={annotationChip}>
              {a}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the output of `@statili/forge`'s `linearRegressionInsights`.
 *
 * Success: one card per `GeneratedInsight`, showing the type badge, human-readable
 * summary, and any chart annotation instructions.
 *
 * Error: a red card showing the user-facing message, actionable helpText, and
 * the original `errorType` from `@statili/stats` for developer reference.
 */
export function InsightPanel({ result }: InsightPanelProps) {
  if (!result.ok) {
    return (
      <div style={panelBase}>
        <div style={errorCard}>
          <div style={errorCardHeader}>Unable to Generate Insights</div>
          <p style={errorMessage}>{result.message}</p>
          <p style={helpTextBox}>💡 {result.helpText}</p>
          <span style={originalErrorTypeBadge}>{result.originalErrorType}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={panelBase}>
      {result.insights.map((insight, i) => (
        <InsightCard key={i} insight={insight} />
      ))}
    </div>
  );
}
