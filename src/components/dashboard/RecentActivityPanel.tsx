"use client";

import React from "react";

/* ──────────────────────────────────────────────
   Contract (from docs/dashboard-component-contract.md)
   ──────────────────────────────────────────────
   interface RecentActivity {
     id: string | number;
     clients: { name: string };
     description: string;
     created_at: string;
   }

   interface RecentActivityPanelProps {
     recentLogs: RecentActivity[];
   }
   ────────────────────────────────────────────── */

interface RecentActivity {
  id: string | number;
  clients: {
    name: string;
  };
  description: string;
  created_at: string;
}

interface RecentActivityPanelProps {
  recentLogs: RecentActivity[];
}

/* ── Inline SVG Icons ─────────────────────────── */

/** Circular person/activity icon for each timeline row */
function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mail / envelope action icon */
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="#94a3b8"
        strokeWidth="1.8"
      />
      <path
        d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8"
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Empty-state clock icon */
function ClockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="1.8" />
      <path
        d="M12 6v6l4 2"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Utility ──────────────────────────────────── */

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ── Main Component ──────────────────────────── */

export default function RecentActivityPanel({
  recentLogs,
}: RecentActivityPanelProps) {
  const logs = recentLogs ?? [];

  return (
    <div style={styles.panel}>
      {/* ── Header ─────────────────────────────── */}
      <div style={styles.header}>
        <span style={styles.title}>Recent Activity</span>
        <span style={styles.viewAll}>View All</span>
      </div>

      {/* ── Timeline List ──────────────────────── */}
      {logs.length > 0 ? (
        <div style={styles.list}>
          {logs.map((log, idx) => {
            const isLast = idx === logs.length - 1;

            return (
              <div key={log.id} style={styles.row}>
                {/* Left: Icon + vertical line */}
                <div style={styles.iconCol}>
                  <div style={styles.iconCircle}>
                    <ActivityIcon />
                  </div>
                  {!isLast && <div style={styles.timelineLine} />}
                </div>

                {/* Center: text content */}
                <div style={styles.textCol}>
                  <span style={styles.clientName}>
                    {log.clients?.name ?? "Unknown"}
                  </span>
                  <span style={styles.description}>{log.description}</span>
                  <span style={styles.timestamp}>
                    {formatTimestamp(log.created_at)}
                  </span>
                </div>

                {/* Right: action icon */}
                <div style={styles.actionCol}>
                  <div style={styles.actionBtn}>
                    <MailIcon />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ────────────────────────── */
        <div style={styles.empty}>
          <ClockIcon />
          <span style={styles.emptyText}>No activity recorded yet.</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Inline styles – mirrors the design reference
   ────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  /* Panel wrapper – clean white / light background */
  panel: {
    background: "#ffffff",
    borderRadius: 20,
    padding: "24px 20px 16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
  },

  /* Header row */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  /* Title */
  title: {
    fontSize: 17,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },

  /* "View All" link */
  viewAll: {
    fontSize: 12,
    fontWeight: 600,
    color: "#3b82f6",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },

  /* Scrollable list area */
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflowY: "auto",
    flex: 1,
  },

  /* Each activity row */
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    minHeight: 68,
  },

  /* Left column: icon + line */
  iconCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 36,
    flexShrink: 0,
    position: "relative",
  },

  /* Circular icon wrapper */
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "2px solid #dbeafe",
    zIndex: 1,
  },

  /* Vertical timeline connector */
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    background: "#e2e8f0",
    borderRadius: 1,
  },

  /* Text content column */
  textCol: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    paddingBottom: 12,
  },

  /* Client name */
  clientName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },

  /* Description */
  description: {
    fontSize: 12,
    fontWeight: 500,
    color: "#64748b",
    lineHeight: 1.4,
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },

  /* Timestamp */
  timestamp: {
    fontSize: 11,
    fontWeight: 500,
    color: "#94a3b8",
    marginTop: 3,
  },

  /* Right-side action column */
  actionCol: {
    display: "flex",
    alignItems: "flex-start",
    paddingTop: 8,
    flexShrink: 0,
  },

  /* Action button wrapper */
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s",
  },

  /* Empty state */
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 16px",
    gap: 12,
  },

  emptyText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#94a3b8",
    textAlign: "center",
  },
};
