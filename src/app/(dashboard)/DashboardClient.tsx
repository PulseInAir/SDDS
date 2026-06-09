'use client';

import { useState } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import Link from 'next/link';
import AYSelect from '@/components/AYSelect';
import {
  Users, CheckCircle2, AlertCircle, IndianRupee,
  ArrowRight, Plus, ListCollapse, Clock, MessageSquare,
  Eye, EyeOff, ClipboardCheck, Copy, ChevronRight, HelpCircle
} from 'lucide-react';

interface DashboardClientProps {
  totalClients: number;
  completedFilings: number;
  yetToFileFilings: number;
  pendingFilings: number;
  refundsPending: number;
  intimationsPending: number;
  totalOutstanding: number;
  totalBilled: number;
  queueItems: any[];
  recentLogs: any[];
  currentAY: string;
  ayOptions: string[];
}

export default function DashboardClient({
  totalClients,
  completedFilings,
  yetToFileFilings,
  pendingFilings,
  refundsPending,
  intimationsPending,
  totalOutstanding,
  totalBilled,
  queueItems,
  recentLogs,
  currentAY,
  ayOptions
}: DashboardClientProps) {
  const { isPrivacyMode } = usePrivacy();

  // Eyeball reveals states
  const [revealRevenue, setRevealRevenue] = useState(false);
  const [revealedRowIds, setRevealedRowIds] = useState<Record<string, boolean>>({});

  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };

  const maskValue = (value: string | number, isMasked: boolean) => {
    return isMasked ? '••••' : String(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section with AY selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Practice Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of clients, filings, and collections.</p>
        </div>

        <div className="flex items-center space-x-3">
          <label htmlFor="ay-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Assessment Year:
          </label>
          <div className="relative">
            <AYSelect currentAY={currentAY} ayOptions={ayOptions} />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
          <Link
            href="/clients"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </Link>
        </div>
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        
        {/* Filed filings Card (Primary Highlight Card) */}
        <Link
          href={`/queue?ay=${currentAY}&tab=Filed`}
          className="bg-slate-900/40 border border-emerald-500/35 hover:border-emerald-500/50 rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filed This AY</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-4">{completedFilings}</p>
          <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span>Click to view files list</span>
          </div>
        </Link>

        {/* Yet To File Card */}
        <Link
          href={`/queue?ay=${currentAY}&tab=Yet To File`}
          className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Yet to File</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-4">{yetToFileFilings}</p>
          <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span>Awaiting documents enrollment</span>
          </div>
        </Link>

        {/* Pending filings Card */}
        <Link
          href={`/queue?ay=${currentAY}`}
          className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Filings</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-4">{pendingFilings}</p>
          <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span>Filing queue workload</span>
          </div>
        </Link>

        {/* Refunds Pending Card */}
        <Link
          href={`/queue?ay=${currentAY}`}
          className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Refunds Pending</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-4">{refundsPending}</p>
          <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span>Claims yet to be received</span>
          </div>
        </Link>

        {/* Intimations Pending Card */}
        <Link
          href={`/queue?ay=${currentAY}`}
          className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Intimations Pending</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-4">{intimationsPending}</p>
          <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span>Filed orders under CPC process</span>
          </div>
        </Link>

        {/* Outstanding Payment Card */}
        <div
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Outstanding Bal.</span>
            <div className="flex items-center space-x-1">
              {isPrivacyMode && (
                <button
                  onClick={() => setRevealRevenue(!revealRevenue)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                  title="Reveal Revenue figures"
                >
                  {revealRevenue ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              )}
              <Link href={`/invoices?ay=${currentAY}`} className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <IndianRupee className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-4">
            ₹{maskValue(totalOutstanding.toLocaleString('en-IN'), isPrivacyMode && !revealRevenue)}
          </p>
          <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span>Billed: ₹{maskValue(totalBilled.toLocaleString('en-IN'), isPrivacyMode && !revealRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Main layout contents split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filing Queue list */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Filing Work Queue (AY {currentAY})</h2>
              <Link
                href="/queue"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
              >
                <span>Full Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {queueItems && queueItems.length > 0 ? (
              <div className="space-y-4">
                {queueItems.map((item) => {
                  const isMasked = isPrivacyMode && !revealedRowIds[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-white text-sm">{item.clients?.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-mono text-slate-400">
                            {maskText(item.clients?.pan || '', isMasked)}
                          </span>
                          <span className="text-slate-750 text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-400">
                            {maskText(item.clients?.mobile || '', isMasked)}
                          </span>
                          {isPrivacyMode && (
                            <button
                              onClick={() => setRevealedRowIds(p => ({ ...p, [item.id]: !p[item.id] }))}
                              className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-350 ml-1.5 transition-colors"
                              title="Reveal Row PAN/Mobile"
                            >
                              {revealedRowIds[item.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/15">
                          {item.filing_status}
                        </span>
                        <Link
                          href={`/clients/${item.client_id}`}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <ListCollapse className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                <Clock className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No clients currently pending in the queue for this AY.</p>
                <Link
                  href="/clients"
                  className="inline-block mt-4 text-xs font-semibold text-blue-400 hover:underline"
                >
                  Go to Client Directory
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>

          {recentLogs && recentLogs.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentLogs.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== recentLogs.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 ring-4 ring-slate-950">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs font-semibold text-white">{log.clients?.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{log.description}</p>
                          <span className="text-[10px] text-slate-600 mt-1 block">
                            {new Date(log.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
              <Clock className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No activity recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
