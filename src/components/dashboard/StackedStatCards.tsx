"use client";

import React from "react";

/* ──────────────────────────────────────────────
   Contract (from docs/dashboard-component-contract.md)
   ──────────────────────────────────────────────
   interface StackedStatCardsProps {
     refundsPending: number;
     totalOutstanding: number;
     totalBilled: number;
   }
   ────────────────────────────────────────────── */

interface StackedStatCardsProps {
  refundsPending: number;
  totalOutstanding: number;
  totalBilled: number;
}

/** ₹ icon inside a translucent circle */
function RupeeIcon({ bg, color = "white" }: { bg: string; color?: string }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 4H17M7 8H17M12 4V8M9.5 8C9.5 11 12 14 15 16L9 20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Small circular right-arrow action button */
function CircleArrowButton() {
  return (
    <button
      type="button"
      style={styles.arrowBtn}
      aria-label="View outstanding balance details"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M7 5L11 9L7 13"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function StackedStatCards({
  refundsPending,
  totalOutstanding,
  totalBilled,
}: StackedStatCardsProps) {
  return (
    <div style={styles.stack}>
      {/* ── Refunds Pending (Blue) ── */}
      <div style={styles.blueCard}>
        <div style={styles.cardContent}>
          <RupeeIcon bg="rgba(255,255,255,0.2)" color="#fff" />
          <div style={styles.textBlock}>
            <span style={styles.cardLabel}>Refunds Pending</span>
            <span style={styles.cardValue}>{refundsPending}</span>
          </div>
        </div>
      </div>

      {/* ── Outstanding Bal. (Pink / Coral) ── */}
      <div style={styles.pinkCard}>
        <div style={styles.cardContent}>
          <RupeeIcon bg="rgba(255,255,255,0.25)" color="#fff" />
          <div style={styles.textBlock}>
            <span style={styles.cardLabel}>Outstanding Bal.</span>
            <span style={styles.cardValue}>
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </span>
            <span style={styles.sublabel}>
              Billed: ₹{totalBilled.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        {/* Arrow action button – bottom-right corner */}
        <div style={styles.arrowWrap}>
          <CircleArrowButton />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Inline styles – mirrors the design reference
   ────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  /* Vertical stack container */
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    height: "100%",
    boxSizing: "border-box",
  },

  /* ── Blue card (Refunds Pending) ── */
  blueCard: {
    flex: 1,
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    borderRadius: 24,
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: "0 12px 32px rgba(37,99,235,0.25)",
  },

  /* ── Pink card (Outstanding Bal.) ── */
  pinkCard: {
    flex: 1,
    background: "linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #f43f5e 100%)",
    borderRadius: 24,
    padding: "32px 28px 24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: "0 12px 32px rgba(244,114,182,0.3)",
  },

  /* Shared row layout inside each card */
  cardContent: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  /* Text block beside the icon */
  textBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  /* Card label (e.g. "Refunds Pending") */
  cardLabel: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.02em",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 2,
  },

  /* Big numeric value */
  cardValue: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#fff",
  },

  /* Sublabel (e.g. "Billed: ₹0") */
  sublabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },

  /* Wrapper that pushes the arrow to bottom-right */
  arrowWrap: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 4,
  },

  /* Circular arrow button */
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s ease, border-color 0.2s ease",
    padding: 0,
    backdropFilter: "blur(4px)",
  },
};
