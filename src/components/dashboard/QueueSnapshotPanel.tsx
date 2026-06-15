import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface QueueItem {
  id: string | number;
  client_id: string | number;
  clients: { 
    name: string; 
    pan: string; 
    mobile: string;
  };
  filing_status: string;
  recordUrl: string;
}

export interface QueueSnapshotPanelProps {
  queueItems: QueueItem[];
  isLoading: boolean;
  error?: string;
  emptyStateMessage: string;
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes('yet to file') || s.includes('pending') || s.includes('progress')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (s.includes('filed') || s.includes('completed')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (s.includes('rectification') || s.includes('notice') || s.includes('attention')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export function QueueSnapshotPanel({
  queueItems,
  isLoading,
  error,
  emptyStateMessage,
}: QueueSnapshotPanelProps) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-10 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 md:mb-10">
        <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">
          Filing Work Queue <span className="text-slate-400 font-medium ml-1.5">(Snapshot)</span>
        </h2>
        <Link 
          href="/queue" 
          className="text-[13px] font-bold text-blue-600 hover:text-blue-700 focus:outline-none focus:underline uppercase tracking-wide shrink-0 ml-4"
        >
          View All
        </Link>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-4">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
                <div className="flex gap-4 items-center shrink-0">
                  <div className="w-24 h-7 bg-slate-100 rounded-full" />
                  <div className="w-9 h-9 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-[14px] font-medium p-5 bg-red-50 rounded-2xl border border-red-100">
            {error}
          </div>
        ) : queueItems.length === 0 ? (
          <div className="text-slate-500 text-[14px] font-medium text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="flex flex-col">
            {queueItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between py-4.5 border-b border-slate-100/80 last:border-0 last:pb-0 group hover:bg-slate-50/50 -mx-4 px-4 rounded-2xl transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-[15px] font-bold text-slate-800 truncate">
                    {item.clients.name}
                  </div>
                  <div className="text-[12px] text-slate-400 mt-1 uppercase tracking-widest font-bold truncate">
                    {item.clients.pan}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-5 shrink-0">
                  <div className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest border ${getStatusColor(item.filing_status)}`}>
                    {item.filing_status}
                  </div>
                  <Link 
                    href={item.recordUrl}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-100 shadow-sm"
                    aria-label={`View record for ${item.clients.name}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
