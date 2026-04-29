import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { multilinear } from "@statili/stats";
import type { MultiDataPoint } from "@statili/stats";
import { MultiStatsPanel } from "../components/MultiStatsPanel";
import { MULTI_DATASETS } from "../data/datasets";
import type { MultiDatasetKey } from "../data/datasets";

const MLR_KEYS: MultiDatasetKey[] = ["house_prices","student_scores","multi_error_insufficient"];

interface PvAProps { predicted: number[]; actual: number[]; targetName: string; width: number; height: number }

function PredictedVsActual({ predicted, actual, targetName, width, height }: PvAProps) {
  const m = { top:20, right:20, bottom:44, left:60 };
  const iW = width - m.left - m.right;
  const iH = height - m.top - m.bottom;
  const all = [...predicted, ...actual];
  const mn = Math.min(...all), mx = Math.max(...all);
  const pad = (mx - mn) * 0.1, lo = mn - pad, hi = mx + pad;
  const sc = (v: number) => (v - lo) / (hi - lo);
  const px = (v: number) => m.left + sc(v) * iW;
  const py = (v: number) => m.top + (1 - sc(v)) * iH;
  const ticks = 5;
  return (
    <div>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>Predicted vs Actual — {targetName}</div>
      <svg width={width} height={height} style={{ fontFamily:"system-ui,sans-serif", overflow:"visible" }}>
        <line x1={px(lo)} y1={py(lo)} x2={px(hi)} y2={py(hi)} stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="4 3" />
        {predicted.map((p,i) => <circle key={i} cx={px(p)} cy={py(actual[i])} r={4} fill="#6366f1" fillOpacity={0.65} stroke="#4f46e5" strokeWidth={1} />)}
        <line x1={m.left} y1={m.top+iH} x2={m.left+iW} y2={m.top+iH} stroke="#e5e7eb" />
        {Array.from({length:ticks+1},(_,i)=>{ const v=lo+i*(hi-lo)/ticks; return <text key={i} x={px(v)} y={m.top+iH+16} textAnchor="middle" fontSize={10} fill="#6b7280">{v.toFixed(0)}</text>; })}
        <text x={m.left+iW/2} y={m.top+iH+36} textAnchor="middle" fontSize={11} fill="#374151">Predicted</text>
        <line x1={m.left} y1={m.top} x2={m.left} y2={m.top+iH} stroke="#e5e7eb" />
        {Array.from({length:ticks+1},(_,i)=>{ const v=lo+i*(hi-lo)/ticks; return <text key={i} x={m.left-6} y={py(v)+4} textAnchor="end" fontSize={10} fill="#6b7280">{v.toFixed(0)}</text>; })}
        <text transform="rotate(-90)" x={-(m.top+iH/2)} y={14} textAnchor="middle" fontSize={11} fill="#374151">Actual</text>
      </svg>
    </div>
  );
}

interface Args { dataset: MultiDatasetKey; precision: number; chartWidth: number; chartHeight: number }

function Demo({ dataset, precision, chartWidth, chartHeight }: Args) {
  const { data, description, featureNames, targetName } = MULTI_DATASETS[dataset];
  const result = multilinear({ precision }, data as MultiDataPoint[]);
  const predicted = result.ok ? result.points.map(p => p.y) : [];
  const actual    = (data as MultiDataPoint[]).filter(d => d.y !== null).map(d => d.y as number);
  return (
    <div style={{ display:"flex", gap:24, alignItems:"flex-start", fontFamily:"system-ui,sans-serif" }}>
      <div>
        <p style={{ margin:"0 0 10px", color:"#6b7280", fontSize:13, maxWidth:chartWidth }}>{description}</p>
        {result.ok
          ? <PredictedVsActual predicted={predicted} actual={actual} targetName={targetName} width={chartWidth} height={chartHeight} />
          : <div style={{ padding:16, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#dc2626" }}>Error: {result.message}</div>}
      </div>
      <MultiStatsPanel result={result} featureNames={featureNames} />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Stats / Multiple Linear Regression",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:   { control:{ type:"select" }, options: MLR_KEYS, table:{ category:"Data" } },
    precision: { control:{ type:"range", min:0, max:6, step:1 }, table:{ category:"Options" } },
    chartWidth:  { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight: { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { precision:2, chartWidth:480, chartHeight:360 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const HousePrices: Story    = { name:"House Price Prediction (2 features)", args:{ dataset:"house_prices"           } };
export const StudentScores: Story  = { name:"Student Score Prediction (3 features)",args:{ dataset:"student_scores"         } };
export const ErrorInsufficient: Story = { name:"Error: Insufficient Observations",  args:{ dataset:"multi_error_insufficient"} };
