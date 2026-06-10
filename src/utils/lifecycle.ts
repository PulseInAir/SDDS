/**
 * Client Filing Lifecycle — Stage Definitions & Helpers
 *
 * This is the master lifecycle for an ITR filing. Every filing moves
 * through these stages from intake to payment collection.
 *
 * Lifecycle: Yet To File → Documents Requested → Documents Received
 *   → AIS/26AS Checked → Return Prepared → Return Reviewed → Ready to File
 *   → Filed → e-Verified → Under Processing → ITR-V/Ack Saved
 *   → Processed → Intimation Received → Case Closed → Payment Collected
 *
 * Exception branch: Rectification Required (can occur after Filed)
 */

export interface LifecycleStage {
  key: string;
  label: string;
  icon: string;
  group: 'Pre-Filing' | 'Preparation' | 'Post-Filing' | 'Completion' | 'Exception';
  description: string;
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { key: 'Yet To File', label: 'Yet To File', icon: 'Clock', group: 'Pre-Filing', description: 'Client onboarded, filing not started' },
  { key: 'Documents Requested', label: 'Documents Requested', icon: 'Send', group: 'Pre-Filing', description: 'Documents/information requested from client' },
  { key: 'Documents Received', label: 'Documents Received', icon: 'FileCheck', group: 'Pre-Filing', description: 'All required documents collected' },
  { key: 'AIS/26AS Checked', label: 'AIS / 26AS Checked', icon: 'Search', group: 'Preparation', description: 'AIS and 26AS verified from IT portal' },
  { key: 'Return Prepared', label: 'Return Prepared', icon: 'FileText', group: 'Preparation', description: 'ITR computation and form prepared' },
  { key: 'Return Reviewed', label: 'Return Reviewed', icon: 'CheckSquare', group: 'Preparation', description: 'Return reviewed and approved for filing' },
  { key: 'Ready to File', label: 'Ready to File', icon: 'Upload', group: 'Preparation', description: 'Return is finalized and ready for upload' },
  { key: 'Filed', label: 'Filed', icon: 'CheckCircle', group: 'Post-Filing', description: 'Return uploaded to Income Tax portal' },
  { key: 'e-Verified', label: 'e-Verified', icon: 'ShieldCheck', group: 'Post-Filing', description: 'Return e-verified (Aadhaar OTP / EVC / DSC)' },
  { key: 'Under Processing', label: 'Under Processing', icon: 'Loader', group: 'Post-Filing', description: 'Return is being processed by CPC' },
  { key: 'ITR-V/Ack Saved', label: 'ITR-V / Ack Saved', icon: 'Archive', group: 'Completion', description: 'ITR-V acknowledgement downloaded and saved' },
  { key: 'Processed', label: 'Processed', icon: 'CheckCircle2', group: 'Completion', description: 'Return processing completed by CPC' },
  { key: 'Intimation Received', label: 'Intimation Received', icon: 'Bell', group: 'Completion', description: 'Intimation u/s 143(1) received' },
  { key: 'Case Closed', label: 'Case Closed', icon: 'Lock', group: 'Completion', description: 'All ITR-related actions completed' },
  { key: 'Payment Collected', label: 'Payment Collected', icon: 'IndianRupee', group: 'Completion', description: 'Professional fee fully collected' },
  { key: 'Rectification Required', label: 'Rectification Required', icon: 'AlertTriangle', group: 'Exception', description: 'Return needs rectification u/s 154' },
];

/** Main stages (linear flow — excluding exceptions) */
export const LINEAR_STAGES = LIFECYCLE_STAGES.filter(s => s.group !== 'Exception');

/** Exception stages */
export const EXCEPTION_STAGES = LIFECYCLE_STAGES.filter(s => s.group === 'Exception');

/** All stage keys */
export const ALL_STAGE_KEYS = LIFECYCLE_STAGES.map(s => s.key);

/** Stage groups for UI grouping */
export const STAGE_GROUPS = [
  { key: 'Pre-Filing', label: 'Pre-Filing', color: 'blue' },
  { key: 'Preparation', label: 'Preparation', color: 'violet' },
  { key: 'Post-Filing', label: 'Post-Filing', color: 'emerald' },
  { key: 'Completion', label: 'Completion', color: 'green' },
  { key: 'Exception', label: 'Exception', color: 'amber' },
] as const;

/**
 * Backward compatibility mapping for old status values
 * 'Documents Pending' → 'Documents Requested'
 */
const LEGACY_STATUS_MAP: Record<string, string> = {
  'Documents Pending': 'Documents Requested',
};

/** Normalize a status value, mapping legacy names to current ones */
export function normalizeStatus(status: string): string {
  return LEGACY_STATUS_MAP[status] || status;
}

/** Get the index of a stage in the linear flow (0-based). Returns -1 for exceptions. */
export function getStageIndex(status: string): number {
  const normalized = normalizeStatus(status);
  return LINEAR_STAGES.findIndex(s => s.key === normalized);
}

/** Get progress percentage (0–100) based on current stage */
export function getStageProgress(status: string): number {
  const idx = getStageIndex(status);
  if (idx === -1) return 0; // Exception or unknown
  return Math.round((idx / (LINEAR_STAGES.length - 1)) * 100);
}

/** Check if a given stage is complete relative to the current status */
export function isStageComplete(currentStatus: string, checkStage: string): boolean {
  const currentIdx = getStageIndex(currentStatus);
  const checkIdx = getStageIndex(checkStage);
  if (currentIdx === -1 || checkIdx === -1) return false;
  return checkIdx < currentIdx;
}

/** Check if a given stage is the current active stage */
export function isCurrentStage(currentStatus: string, checkStage: string): boolean {
  return normalizeStatus(currentStatus) === normalizeStatus(checkStage);
}

/** Check if a status is an exception status */
export function isExceptionStatus(status: string): boolean {
  return EXCEPTION_STAGES.some(s => s.key === normalizeStatus(status));
}

/** Get the stage metadata for a given status */
export function getStageInfo(status: string): LifecycleStage | undefined {
  const normalized = normalizeStatus(status);
  return LIFECYCLE_STAGES.find(s => s.key === normalized);
}

/** Get the group color for a stage */
export function getGroupColor(status: string): string {
  const info = getStageInfo(status);
  if (!info) return 'slate';
  const group = STAGE_GROUPS.find(g => g.key === info.group);
  return group?.color || 'slate';
}
