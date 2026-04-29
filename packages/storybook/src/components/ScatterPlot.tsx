import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { DataPoint, RegressionResult } from "@statili/stats";

export interface ScatterPlotProps {
  data: DataPoint[];
  result?: RegressionResult;
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const MARGIN = { top: 20, right: 28, bottom: 48, left: 56 };
const POINT_FILL = "#6366f1";       // indigo-500
const POINT_STROKE = "#4f46e5";     // indigo-600
const LINE_STROKE = "#e11d48";      // rose-600
const GRID_STROKE = "#f3f4f6";      // gray-100
const AXIS_TEXT = "#6b7280";        // gray-500
const LABEL_TEXT = "#374151";       // gray-700

/**
 * A minimal D3 scatter plot that optionally overlays a linear regression line.
 *
 * D3 owns the SVG DOM entirely — React only manages the container ref. The
 * chart is fully re-drawn on every meaningful prop change via the useEffect.
 */
export function ScatterPlot({
  data,
  result,
  width = 540,
  height = 360,
  xLabel = "X",
  yLabel = "Y",
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const iW = width - MARGIN.left - MARGIN.right;
  const iH = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    // ── Clear previous render ──────────────────────────────────────────────
    const svg = d3.select(node);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // ── Scales ────────────────────────────────────────────────────────────
    const validData = data.filter(([x, y]) => isFinite(x) && isFinite(y));

    // Provide sensible fallbacks when data is empty or a single point.
    const [xMin = 0, xMax = 10] = d3.extent(validData, (d) => d[0]) as [number, number];
    const [yMin = 0, yMax = 10] = d3.extent(validData, (d) => d[1]) as [number, number];

    const xPad = Math.max((xMax - xMin) * 0.12, 1);
    const yPad = Math.max((yMax - yMin) * 0.12, 1);

    const xScale = d3
      .scaleLinear()
      .domain([xMin - xPad, xMax + xPad])
      .range([0, iW])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPad, yMax + yPad])
      .range([iH, 0])
      .nice();

    // ── Grid lines ────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-iW)
          .tickFormat(() => ""),
      )
      .call((sel) => sel.select(".domain").remove())
      .call((sel) =>
        sel
          .selectAll("line")
          .attr("stroke", GRID_STROKE)
          .attr("stroke-dasharray", "4,3"),
      );

    // ── Axes ──────────────────────────────────────────────────────────────
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSizeOuter(0));

    xAxis.select(".domain").attr("stroke", GRID_STROKE);
    xAxis.selectAll("text").attr("fill", AXIS_TEXT).attr("font-size", 11);
    xAxis.selectAll(".tick line").attr("stroke", GRID_STROKE);

    const yAxis = g
      .append("g")
      .call(d3.axisLeft(yScale).ticks(6).tickSizeOuter(0));

    yAxis.select(".domain").attr("stroke", GRID_STROKE);
    yAxis.selectAll("text").attr("fill", AXIS_TEXT).attr("font-size", 11);
    yAxis.selectAll(".tick line").attr("stroke", GRID_STROKE);

    // ── Axis labels ───────────────────────────────────────────────────────
    g.append("text")
      .attr("x", iW / 2)
      .attr("y", iH + 40)
      .attr("text-anchor", "middle")
      .attr("fill", LABEL_TEXT)
      .attr("font-size", 12)
      .text(xLabel);

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -iH / 2)
      .attr("y", -44)
      .attr("text-anchor", "middle")
      .attr("fill", LABEL_TEXT)
      .attr("font-size", 12)
      .text(yLabel);

    // ── Regression curve (drawn before points so it sits underneath) ──────
    if (result?.ok) {
      const [x0Raw, x1] = xScale.domain();

      // power and logarithmic require x > 0; clamp domain start if needed
      const needsPositiveX = result.method === "logarithmic" || result.method === "power";
      const x0 = needsPositiveX ? Math.max(x0Raw, 1e-3) : x0Raw;

      // Linear gets 2 exact points; all curved methods get 120 interpolated points
      const N = result.method === "linear" ? 2 : 120;
      const curveData: [number, number][] = Array.from({ length: N }, (_, i) => {
        const x = N === 2 ? (i === 0 ? x0 : x1) : x0 + (i / (N - 1)) * (x1 - x0);
        const y = result.predict(x)[1];
        return [x, y] as [number, number];
      }).filter(([, y]) => Number.isFinite(y) && !isNaN(y));

      const lineGenerator = d3
        .line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]));

      g.append("path")
        .datum(curveData)
        .attr("d", lineGenerator)
        .attr("stroke", LINE_STROKE)
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("opacity", 0.85);
    }

    // ── Data points ───────────────────────────────────────────────────────
    g.selectAll<SVGCircleElement, DataPoint>("circle")
      .data(validData)
      .join("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 4.5)
      .attr("fill", POINT_FILL)
      .attr("fill-opacity", 0.65)
      .attr("stroke", POINT_STROKE)
      .attr("stroke-width", 1);
  }, [data, result, iW, iH, xLabel, yLabel]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ fontFamily: "system-ui, -apple-system, sans-serif", overflow: "visible" }}
    />
  );
}
