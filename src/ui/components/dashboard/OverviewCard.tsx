"use client";

import React from "react";

/* ──────────────────────────────────────────────
   Contract (from docs/dashboard-component-contract.md)
   ──────────────────────────────────────────────
   interface OverviewCardProps {
     completedFilings: number;
     yetToFileFilings: number;
     pendingFilings: number;
   }
   ────────────────────────────────────────────── */

interface OverviewCardProps {
  completedFilings: number;
  yetToFileFilings: number;
  pendingFilings: number;
}

/* ── Month labels along the X-axis ── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

/* ── Decorative wave-line points (SVG viewBox: 0 0 540 160) ── */
const WAVE_POINTS = [
  { x: 0, y: 120 },
  { x: 60, y: 95 },
  { x: 120, y: 100 },
  { x: 180, y: 55 },
  { x: 210, y: 40 },   /* peak near Apr */
  { x: 240, y: 65 },
  { x: 300, y: 80 },
  { x: 360, y: 85 },
  { x: 420, y: 90 },
  { x: 480, y: 95 },
  { x: 540, y: 100 },
];

/** Build a smooth cubic-bezier SVG path from discrete points */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.45;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.45;
    d += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

/** Build the closed area-fill path (line → bottom-right → bottom-left) */
function buildAreaPath(points: { x: number; y: number }[], height: number): string {
  const line = buildSmoothPath(points);
  const last = points[points.length - 1];
  return `${line} L${last.x},${height} L${points[0].x},${height} Z`;
}

export default function OverviewCard({
  completedFilings,
  yetToFileFilings,
  pendingFilings,
}: OverviewCardProps) {
  /* ── Highlight index (Apr = index 3) ── */
  const highlightIdx = 3;
  /* X position of the Apr highlight on the SVG (matches WAVE_POINTS at ~180-210 area) */
  const highlightX = 195;

  const SVG_W = 540;
  const SVG_H = 160;

  const linePath = buildSmoothPath(WAVE_POINTS);
  const areaPath = buildAreaPath(WAVE_POINTS, SVG_H);

  return (
    <div style={styles.card}>
      {/* ── Header row ── */}
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Overview</h3>
        <div style={styles.monthlyPill}>
          <span style={styles.monthlyText}>Monthly</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ── Chart area ── */}
      <div style={styles.chartWrapper}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          style={styles.svg}
        >
          <defs>
            {/* Gradient fill below the line */}
            <linearGradient id="ov-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
              <stop offset="100%" stopColor="rgba(30,58,138,0.05)" />
            </linearGradient>

            {/* Vertical highlight bar gradient */}
            <linearGradient id="ov-hl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(96,165,250,0.5)" />
              <stop offset="100%" stopColor="rgba(96,165,250,0.05)" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#ov-area-grad)" />

          {/* Wave line */}
          <path
            d={linePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical highlight bar at Apr */}
          <rect
            x={highlightX - 14}
            y="0"
            width="28"
            height={SVG_H}
            rx="6"
            fill="url(#ov-hl-grad)"
          />

          {/* Highlight dot */}
          <circle cx={highlightX} cy="42" r="7" fill="white" stroke="#f43f5e" strokeWidth="3" />
        </svg>

        {/* Floating tooltip badge */}
        <div style={styles.tooltipBadge}>
          <span style={styles.tooltipNumber}>{yetToFileFilings}</span>
          <span style={styles.tooltipLabel}>Yet To File</span>
        </div>
      </div>

      {/* ── Month labels ── */}
      <div style={styles.monthRow}>
        {MONTHS.map((m, i) => (
          <span
            key={m}
            style={
              i === highlightIdx
                ? { ...styles.monthLabel, ...styles.monthLabelHighlight }
                : styles.monthLabel
            }
          >
            {m}
          </span>
        ))}
      </div>

      {/* ── Bottom metrics ── */}
      <div style={styles.metricsRow}>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Filed This AY</span>
          <span style={styles.metricValue}>{completedFilings}</span>
        </div>
        <div style={styles.metricDivider} />
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Yet To File</span>
          <span style={styles.metricValue}>{yetToFileFilings}</span>
        </div>
        <div style={styles.metricDivider} />
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Pending Filings</span>
          <span style={styles.metricValue}>{pendingFilings}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Inline styles – mirrors the design reference
   ────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  /* Card shell */
  card: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
    borderRadius: 24,
    padding: "32px 32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    boxSizing: "border-box",
    boxShadow: "0 12px 40px rgba(30,58,138,0.25)",
  },

  /* Header */
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "0.01em",
    color: "#fff",
  },
  monthlyPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 9999,
    padding: "6px 14px",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "background 0.2s ease",
  },
  monthlyText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#fff",
  },

  /* Chart */
  chartWrapper: {
    position: "relative",
    width: "100%",
    flex: 1,
    minHeight: 130,
  },
  svg: {
    width: "100%",
    height: "100%",
    display: "block",
  },

  /* Tooltip badge */
  tooltipBadge: {
    position: "absolute",
    top: "12%",
    left: "38%",
    transform: "translateX(-50%)",
    background: "rgba(15,23,42,0.95)",
    borderRadius: 12,
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
    pointerEvents: "none",
    zIndex: 2,
  },
  tooltipNumber: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#fff",
  },
  tooltipLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "rgba(255,255,255,0.7)",
    whiteSpace: "nowrap",
  },

  /* Month labels */
  monthRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0 6px",
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    width: "10%",
  },
  monthLabelHighlight: {
    background: "#fff",
    borderRadius: 9999,
    padding: "4px 12px",
    color: "#1e3a8a",
    fontWeight: 700,
  },

  /* Bottom metrics */
  metricsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: 16,
    marginTop: 4,
  },
  metric: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.02em",
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#fff",
  },
  metricDivider: {
    width: 1,
    height: 40,
    background: "rgba(255,255,255,0.12)",
    flexShrink: 0,
  },
};
