"use client";

import React from "react";

/* ──────────────────────────────────────────────
   Contract (from docs/dashboard-component-contract.md)
   ──────────────────────────────────────────────
   interface SummaryCardsProps {
     completedFilings: number;
     intimationsPending: number;
     totalOutstanding: number;
   }
   ────────────────────────────────────────────── */

interface SummaryCardsProps {
  completedFilings: number;
  intimationsPending: number;
  totalOutstanding: number;
}

/* ── Card definitions ─────────────────────────── */

interface CardDef {
  title: string;
  subtext: string;
  icon: React.ReactNode;
  iconBg: string;
  formatValue: (v: number) => string;
  propKey: keyof SummaryCardsProps;
}

/** Checklist / filed icon */
function FiledIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="3"
        stroke="white"
        strokeWidth="1.8"
      />
      <path
        d="M9 9L11 11L15 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 14H15"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 17H13"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Bell / notification icon */
function BellIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Rupee / currency icon */
function RupeeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4H17M7 8H17M12 4V8M9.5 8C9.5 11 12 14 15 16L9 20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CARDS: CardDef[] = [
  {
    title: "Filed This AY",
    subtext: "Click to view files list",
    icon: <FiledIcon />,
    iconBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    formatValue: (v) => String(v),
    propKey: "completedFilings",
  },
  {
    title: "Intimations Pending",
    subtext: "Filed orders under CPC process",
    icon: <BellIcon />,
    iconBg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    formatValue: (v) => String(v),
    propKey: "intimationsPending",
  },
  {
    title: "Revenue / Collections",
    subtext: "Outstanding Bal.",
    icon: <RupeeIcon />,
    iconBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    formatValue: (v) => `₹${v.toLocaleString("en-IN")}`,
    propKey: "totalOutstanding",
  },
];

/* ── Main component ───────────────────────────── */

export default function SummaryCards({
  completedFilings,
  intimationsPending,
  totalOutstanding,
}: SummaryCardsProps) {
  const values: SummaryCardsProps = {
    completedFilings,
    intimationsPending,
    totalOutstanding,
  };

  return (
    <div style={styles.row}>
      {CARDS.map((card) => (
        <div key={card.title} style={styles.cardWrapper}>
          {/* Floating icon tile – breaks top border of card */}
          <div style={{ ...styles.iconTile, background: card.iconBg }}>
            {card.icon}
          </div>

          {/* Card body */}
          <div style={styles.card}>
            {/* Spacer for the overlapping icon */}
            <div style={styles.iconSpacer} />

            <span style={styles.title}>{card.title}</span>

            <span style={styles.value}>
              {card.formatValue(values[card.propKey])}
            </span>

            <span style={styles.subtext}>{card.subtext}</span>

            <span style={styles.subtext}>{card.subtext}</span>

            {/* Progress track */}
            <div style={styles.progressRow}>
              <div style={styles.progressTrack}>
                <div style={styles.progressFill} />
              </div>
              <span style={styles.progressLabel}>0%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Inline styles – mirrors the design reference
   ────────────────────────────────────────────── */

const ICON_SIZE = 56;
const ICON_OVERLAP = ICON_SIZE / 2; // half above the card

const styles: Record<string, React.CSSProperties> = {
  /* Three-column row */
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    width: "100%",
    boxSizing: "border-box",
  },

  /* Wrapper for icon + card so the icon can overlap */
  cardWrapper: {
    position: "relative",
    paddingTop: ICON_OVERLAP,
  },

  /* Floating icon tile */
  iconTile: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
  },

  /* Blue gradient card body */
  card: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
    borderRadius: 24,
    padding: "16px 24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: "0 12px 32px rgba(30,58,138,0.2)",
  },

  /* Space reserved so text doesn't go behind the icon */
  iconSpacer: {
    height: ICON_OVERLAP + 4,
    width: "100%",
    flexShrink: 0,
  },

  /* Card title */
  title: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },

  /* Large numeric value */
  value: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.15,
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },

  /* Descriptive subtext */
  subtext: {
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 14,
  },

  /* Progress Row */
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },

  /* Progress bar track */
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    background: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },

  /* Progress bar fill (green dot start, represents 0%) */
  progressFill: {
    width: "0%",
    minWidth: 8,
    height: "100%",
    borderRadius: 2,
    background: "#22c55e",
  },

  /* Percentage label */
  progressLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
  },
};
