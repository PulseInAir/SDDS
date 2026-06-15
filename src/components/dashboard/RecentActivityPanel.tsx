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
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-slate-800">
          Recent Activity
        </h2>
        <Link 
          href="/activity" 
          className="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-1">
            {recentLogs.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-blue-50 border-[3px] border-white flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors shadow-sm z-10">
                  <User className="w-3.5 h-3.5" />
                </div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-semibold text-slate-800">
                      {log.clients.name}
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5 leading-relaxed">
                      {log.description}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                  
                  {(log.actionHref || log.onActionClick) && (
                    <div className="shrink-0 mt-1">
                      {log.actionHref ? (
                        <Link 
                          href={log.actionHref}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          onClick={log.onActionClick}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-100"
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
