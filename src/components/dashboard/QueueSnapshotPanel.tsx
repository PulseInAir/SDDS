"use client";

import React from "react";

/* ──────────────────────────────────────────────
   Contract (from docs/dashboard-component-contract.md)
   ──────────────────────────────────────────────
   interface QueueItem {
     id: string | number;
     client_id: string | number;
     clients: {
       name: string;
       pan: string;
       mobile: string;
     };
     filing_status: string;
   }

   interface QueueSnapshotPanelProps {
     queueItems: QueueItem[];
   }
   ────────────────────────────────────────────── */

interface QueueItem {
  id: string | number;
  client_id: string | number;
  clients: {
    name: string;
    pan: string;
    mobile: string;
  };
  filing_status: string;
}

interface QueueSnapshotPanelProps {
  queueItems: QueueItem[];
}

/* ── Inline SVG Icons ─────────────────────────── */

/** Three-line list / menu icon for each row's action */
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 6h13M8 12h13M8 18h13"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3.5" cy="6" r="1.5" fill="#94a3b8" />
      <circle cx="3.5" cy="12" r="1.5" fill="#94a3b8" />
      <circle cx="3.5" cy="18" r="1.5" fill="#94a3b8" />
    </svg>
  );
}

/** Empty-state inbox icon */
function InboxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 13h4l2 3h6l2-3h4"
        stroke="#cbd5e1"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="3"
        stroke="#cbd5e1"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/* ── Helpers ──────────────────────────────────── */

/** Return a readable status label */
function statusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "yet_to_file":
    case "yet to file":
      return "Yet To File";
    case "in_progress":
    case "in progress":
      return "In Progress";
    case "filed":
      return "Filed";
    default:
      return status || "Yet To File";
  }
}

/** Return chip style variants based on filing status */
function chipStyle(
  status: string
): { bg: string; color: string } {
  switch (status?.toLowerCase()) {
    case "filed":
      return { bg: "#dcfce7", color: "#16a34a" };
    case "in_progress":
    case "in progress":
      return { bg: "#dbeafe", color: "#2563eb" };
    default:
      // "Yet To File" / fallback → amber
      return { bg: "#fef3c7", color: "#d97706" };
  }
}

/* ── Main Component ──────────────────────────── */

export default function QueueSnapshotPanel({
  queueItems,
}: QueueSnapshotPanelProps) {
  const items = (queueItems ?? []).slice(0, 3);

  return (
    <div style={styles.panel}>
      {/* ── Header ─────────────────────────────── */}
      <div style={styles.header}>
        <span style={styles.title}>
          Filing Work Queue{" "}
          <span style={styles.titleSuffix}>(Snapshot)</span>
        </span>
        <span style={styles.viewAll}>View All</span>
      </div>

      {/* ── Client Rows ───────────────────────── */}
      {items.length > 0 ? (
        <div style={styles.list}>
          {items.map((item) => {
            const chip = chipStyle(item.filing_status);
            return (
              <div key={item.id} style={styles.row}>
                {/* Left: Client info */}
                <div style={styles.clientInfo}>
                  <span style={styles.clientName}>
                    {item.clients?.name ?? "Unknown"}
                  </span>
                  <span style={styles.pan}>
                    {item.clients?.pan ?? "—"}
                  </span>
                </div>

                {/* Right: Status chip + list icon */}
                <div style={styles.rightCol}>
                  <span
                    style={{
                      ...styles.chip,
                      background: chip.bg,
                      color: chip.color,
                    }}
                  >
                    {statusLabel(item.filing_status)}
                  </span>
                  <div style={styles.actionBtn}>
                    <ListIcon />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ────────────────────────── */
        <div style={styles.empty}>
          <InboxIcon />
          <span style={styles.emptyText}>No items in queue.</span>
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

  /* "(Snapshot)" suffix in title */
  titleSuffix: {
    fontWeight: 500,
    fontSize: 13,
    color: "#64748b",
  },

  /* "View All" link */
  viewAll: {
    fontSize: 12,
    fontWeight: 600,
    color: "#3b82f6",
    cursor: "pointer",
    letterSpacing: "0.01em",
    flexShrink: 0,
  },

  /* List wrapper */
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    flex: 1,
  },

  /* Each queue row */
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  /* Left: client name + PAN column */
  clientInfo: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
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

  /* PAN / sub-text */
  pan: {
    fontSize: 11,
    fontWeight: 500,
    color: "#94a3b8",
    marginTop: 2,
    letterSpacing: "0.04em",
  },

  /* Right column: chip + action */
  rightCol: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  /* Status chip / badge */
  chip: {
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 6,
    whiteSpace: "nowrap" as const,
    lineHeight: 1.3,
    letterSpacing: "0.01em",
  },

  /* Action button (list icon wrapper) */
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
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
    padding: "36px 16px",
    gap: 10,
  },

  emptyText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#94a3b8",
    textAlign: "center",
  },
};
