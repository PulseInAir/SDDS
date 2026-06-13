'use client';

import { useState } from 'react';
import {
  LINEAR_STAGES,
  EXCEPTION_STAGES,
  STAGE_GROUPS,
  getStageIndex,
  isStageComplete,
  isCurrentStage,
  isExceptionStatus,
  normalizeStatus,
  getStageProgress,
  type LifecycleStage,
} from '@/utils/lifecycle';
import {
  Clock, Send, FileCheck, Search, FileText, CheckSquare, Upload,
  CheckCircle, ShieldCheck, Loader, Archive, CheckCircle2, Bell,
  Lock, IndianRupee, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock, Send, FileCheck: FileCheck, Search, FileText, CheckSquare,
  Upload, CheckCircle, ShieldCheck, Loader, Archive, CheckCircle2,
  Bell, Lock, IndianRupee, AlertTriangle, ChevronDown, ChevronUp,
};

interface LifecycleTrackerProps {
  currentStatus: string;
  onStageClick?: (stageKey: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function LifecycleTracker({
  currentStatus,
  onStageClick,
  disabled = false,
  compact = false,
}: LifecycleTrackerProps) {
  const normalized = normalizeStatus(currentStatus);
  const isException = isExceptionStatus(normalized);
  const progress = getStageProgress(normalized);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderStageIcon = (stage: LifecycleStage, isComplete: boolean, isCurrent: boolean) => {
    const IconComponent = ICON_MAP[stage.icon] || Clock;
    const sizeClass = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';

    if (isCurrent) {
      return <IconComponent className={`${sizeClass} text-white`} />;
    }
    if (isComplete) {
      return <CheckCircle className={`${sizeClass} text-emerald-400`} />;
    }
    return <IconComponent className={`${sizeClass} text-slate-600`} />;
  };

  const getStageStyles = (stage: LifecycleStage, isComplete: boolean, isCurrent: boolean) => {
    if (isCurrent && !isException) {
      return {
        dot: 'bg-blue-500 ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30',
        line: 'bg-blue-500',
        text: 'text-white font-bold',
        desc: 'text-blue-300',
      };
    }
    if (isCurrent && isException) {
      return {
        dot: 'bg-amber-500 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/30',
        line: 'bg-amber-500',
        text: 'text-amber-300 font-bold',
        desc: 'text-amber-400/70',
      };
    }
    if (isComplete) {
      return {
        dot: 'bg-emerald-500/20 border border-emerald-500/40',
        line: 'bg-emerald-500/40',
        text: 'text-emerald-400',
        desc: 'text-slate-500',
      };
    }
    return {
      dot: 'bg-slate-800 border border-slate-700',
      line: 'bg-slate-800',
      text: 'text-slate-500',
      desc: 'text-slate-600',
    };
  };

  // Group the linear stages
  const groupedLinear = STAGE_GROUPS
    .filter(g => g.key !== 'Exception')
    .map(group => ({
      ...group,
      stages: LINEAR_STAGES.filter(s => s.group === group.key),
    }));

  return (
    <div className="space-y-1">
      {/* Progress Bar Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lifecycle</span>
        <span className="text-[10px] font-bold text-slate-400 tabular-nums">{progress}%</span>
      </div>

      {/* Thin progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: isException
              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
              : 'linear-gradient(90deg, #3b82f6, #10b981)',
          }}
        />
      </div>

      {/* Stage Groups */}
      {groupedLinear.map((group) => {
        const isCollapsed = collapsedGroups[group.key];
        const groupStages = group.stages;
        const hasCurrentStage = groupStages.some(s => isCurrentStage(normalized, s.key));
        const allComplete = groupStages.every(s => isStageComplete(normalized, s.key));

        return (
          <div key={group.key} className="mb-1">
            {/* Group Header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                hasCurrentStage
                  ? 'text-blue-400 bg-blue-500/5'
                  : allComplete
                    ? 'text-emerald-500/70 bg-emerald-500/5'
                    : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <span>{group.label}</span>
              {isCollapsed ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </button>

            {/* Stages */}
            {!isCollapsed && (
              <div className={`ml-2 ${compact ? 'space-y-0' : 'space-y-0'}`}>
                {groupStages.map((stage, stageIdx) => {
                  const complete = isStageComplete(normalized, stage.key);
                  const current = isCurrentStage(normalized, stage.key);
                  const styles = getStageStyles(stage, complete, current);
                  const isLast = stageIdx === groupStages.length - 1;

                  return (
                    <div key={stage.key} className="flex items-stretch">
                      {/* Left: dot + connector line */}
                      <div className="flex flex-col items-center mr-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => !disabled && onStageClick?.(stage.key)}
                          disabled={disabled}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                          } ${styles.dot}`}
                          title={stage.description}
                        >
                          {renderStageIcon(stage, complete, current)}
                        </button>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 min-h-[16px] ${styles.line}`} />
                        )}
                      </div>

                      {/* Right: label */}
                      <div className={`pb-3 pt-1 ${compact ? 'pb-2' : ''}`}>
                        <button
                          type="button"
                          onClick={() => !disabled && onStageClick?.(stage.key)}
                          disabled={disabled}
                          className={`text-xs leading-tight block text-left ${
                            disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
                          } ${styles.text}`}
                        >
                          {stage.label}
                        </button>
                        {!compact && current && (
                          <span className={`text-[10px] leading-tight ${styles.desc}`}>
                            {stage.description}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Exception Stages */}
      {EXCEPTION_STAGES.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest px-2">
            Exceptions
          </span>
          {EXCEPTION_STAGES.map((stage) => {
            const current = isCurrentStage(normalized, stage.key);
            const styles = getStageStyles(stage, false, current);

            return (
              <div key={stage.key} className="flex items-center mt-2 ml-2">
                <button
                  type="button"
                  onClick={() => !disabled && onStageClick?.(stage.key)}
                  disabled={disabled}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 mr-3 ${
                    disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                  } ${styles.dot}`}
                  title={stage.description}
                >
                  {renderStageIcon(stage, false, current)}
                </button>
                <button
                  type="button"
                  onClick={() => !disabled && onStageClick?.(stage.key)}
                  disabled={disabled}
                  className={`text-xs ${
                    disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
                  } ${styles.text}`}
                >
                  {stage.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
