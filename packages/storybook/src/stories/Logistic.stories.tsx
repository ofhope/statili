import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { logistic } from "@statili/stats";
import type { MultiDataPoint } from "@statili/stats";
import { MultiStatsPanel } from "../components/MultiStatsPanel";
import { MULTI_DATASETS } from "../data/datasets";
import type { MultiDatasetKey } from "../data/datasets";

const LOG_KEYS: MultiDatasetKey[] = ["logistic_purchase","logistic_pass_fail","logistic_error_single_class"];

interface SigmoidProps { data: MultiDataPoint[]; probs: number[]; featureName: string; targetName: string; width: number; height: number }

function SigmoidChart({ data, probs, featureName, targetName, width, height }: SigmoidProps) {
  const m = { top:20, right:20, bottom:44, left:56 };
  const iW = width - m.left - m.right;
  const iH = height - m.top - m.bottom;
  const xs = data.map(d => d.x[0]);
  const mnX = Math.min(...xs), mxX = Math.max(...xs);
  const padX = (mxX - mnX) * 0.1, loX = mnX - padX, hiX = mxX + padX;
  const scX = (v: number) => m.left + ((v-loX)/(hiX-loX)) * iW;
  const scY = (v: number) => m.top + (1-v) * iH;
  return (
    <div>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{featureName} vs P(y=1) — {targetName}</div>
      <svg width={width} height={height} style={{ fontFamily:"system-ui,sans-serif", overflow:"visible" }}>
        <line x1={m.left} y1={scY(0.5)} x2={m.left+iW} y2={scY(0.5)} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
        <text x={m.left+iW-2} y={scY(0.5)-4} textAnchor="end" fontSize={9} fill="#f59e0b">P=0.5</text>
        {data.map((d,i) => {
          const cls = d.y as number;
          return <g key={i}>
            <line x1={scX(d.x[0])} y1={scY(cls===1?1:0)-4} x2={scX(d.x[0])} y2={scY(cls===1?1:0)+4} stroke={cls===1?"#16a34a":"#dc2626"} strokeWidth={1.5} />
            <circle cx={scX(d.x[0])} cy={scY(probs[i])} r={4} fill="#6366f1" fillOpacity={0.7} stroke="#4f46e5" strokeWidth={1} />
          </g>;
        })}
        <line x1={m.left} y1={m.top+iH} x2={m.left+iW} y2={m.top+iH} stroke="#e5e7eb" />
        {[mnX, (mnX+mxX)/2, mxX].map(v => <text key={v} x={scX(v)} y={m.top+iH+16} textAnchor="middle" fontSize={10} fill="#6b7280">{v.toFixed(1)}</text>)}
        <text x={m.left+iW/2} y={m.top+iH+36} textAnchor="middle" fontSize={11} fill="#374151">{featureName}</text>
        <line x1={m.left} y1={m.top} x2={m.left} y2={m.top+iH} stroke="#e5e7eb" />
        {[0,0.25,0.5,0.75,1].map(v => <text key={v} x={m.left-6} y={scY(v)+4} textAnchor="end" fontSize={10} fill="#6b7280">{v.toFixed(2)}</text>)}
        <text transform="rotate(-90)" x={-(m.top+iH/2)} y={14} textAnchor="middle" fontSize={11} fill="#374151">P(y=1)</text>
      </svg>
    </div>
  );
}

interface Args { dataset: MultiDatasetKey; learningRate: number; iterations: number; precision: number; chartWidth: number; chartHeight: number }

function Demo({ dataset, learningRate, iterations, precision, chartWidth, chartHeight }: Args) {
  const { data, description, featureNames, targetName } = MULTI_DATASETS[dataset];
  const result = logistic({ learningRate, iterations, precision }, data as MultiDataPoint[]);
  const probs  = result.ok ? result.points.map(p => p.y) : [];
  return (
    <div style={{ display:"flex", gap:24, alignItems:"flex-start", fontFamily:"system-ui,sans-serif" }}>
      <div>
        <p style={{ margin:"0 0 10px", color:"#6b7280", fontSize:13, maxWidth:chartWidth }}>{description}</p>
        {result.ok
          ? <SigmoidChart data={data as MultiDataPoint[]} probs={probs} featureName={featureNames[0]??"x1"} targetName={targetName} width={chartWidth} height={chartHeight} />
          : <div style={{ padding:16, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#dc2626" }}>Error: {result.message}</div>}
      </div>
      <MultiStatsPanel result={result} featureNames={featureNames} />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Stats / Logistic Regression",
  component: Demo,
  parameters: { layout:"padded" },
  argTypes: {
    dataset:      { control:{ type:"select" }, options: LOG_KEYS, table:{ category:"Data" } },
    learningRate: { control:{ type:"range", min:0.001, max:1, step:0.01 }, table:{ category:"Hyperparameters" } },
    iterations:   { control:{ type:"range", min:100, max:5000, step:100 }, table:{ category:"Hyperparameters" } },
    precision:    { control:{ type:"range", min:2, max:6, step:1 }, table:{ category:"Options" } },
    chartWidth:   { control:{ type:"range", min:300, max:800, step:20 }, table:{ category:"Display" } },
    chartHeight:  { control:{ type:"range", min:200, max:600, step:20 }, table:{ category:"Display" } },
  },
  args: { learningRate:0.1, iterations:1000, precision:4, chartWidth:500, chartHeight:340 },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const PurchasePrediction: Story = { name:"Purchase Prediction (1 feature)",      args:{ dataset:"logistic_purchase"          } };
export const PassFail: Story           = { name:"Pass / Fail Classification (2 features)",args:{ dataset:"logistic_pass_fail"         } };
export const HyperparamTuning: Story   = { name:"Hyperparameter Sensitivity",            args:{ dataset:"logistic_purchase", learningRate:0.001, iterations:50 } };
export const ErrorSingleClass: Story   = { name:"Error: Single Class",                   args:{ dataset:"logistic_error_single_class" } };
