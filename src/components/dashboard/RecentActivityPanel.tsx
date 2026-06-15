import React from 'react';
import Link from 'next/link';
import { ChevronRight, Clock, User } from 'lucide-react';

export interface RecentActivity {
  id: string | number;
  clients: { 
    name: string;
  };
  description: string;
  created_at: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export interface RecentActivityPanelProps {
  recentLogs: RecentActivity[];
  isLoading: boolean;
  error?: string;
  emptyStateMessage: string;
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function RecentActivityPanel({
  recentLogs,
  isLoading,
  error,
  emptyStateMessage,
}: RecentActivityPanelProps) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-10 flex flex-col h-full">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">
          Recent Activity
        </h2>
        <Link 
          href="/activity" 
          className="text-[13px] font-bold text-blue-600 hover:text-blue-700 focus:outline-none focus:underline uppercase tracking-wide"
        >
          View All
        </Link>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-3 py-1.5">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-[14px] p-5 bg-red-50 rounded-2xl border border-red-100 font-medium">
            {error}
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-slate-500 text-[14px] font-medium text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-10 py-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="relative pl-7 group">
                <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-blue-50 border-[4px] border-white flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors shadow-sm z-10">
                  <User className="w-4 h-4" />
                </div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 pt-0.5">
                    <div className="text-[15px] font-bold text-slate-800">
                      {log.clients.name}
                    </div>
                    <div className="text-[14px] text-slate-500 mt-1 leading-relaxed">
                      {log.description}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 mt-2.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                  
                  {(log.actionHref || log.onActionClick) && (
                    <div className="shrink-0 mt-1">
                      {log.actionHref ? (
                        <Link 
                          href={log.actionHref}
                          className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-100 shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          onClick={log.onActionClick}
                          className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-100 shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
