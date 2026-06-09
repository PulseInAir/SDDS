'use client';

import { useState, useTransition } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { decryptPasswordAction, triggerQueueRolloverAction, logWhatsAppActivityAction, getSystemSettingsAction } from '../clients/actions';
import { 
  Search, Eye, EyeOff, Copy, Phone, MessageSquare, 
  RefreshCw, ClipboardCheck, ArrowUpRight, Loader2, UserPlus, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

interface QueueItem {
  id: string;
  client_id: string;
  assessment_year: string;
  filing_status: string;
  itr_type: string | null;
  acknowledgement_number: string | null;
  clients: {
    name: string;
    pan: string;
    mobile: string;
    email: string | null;
    dob: string;
  };
}

interface QueueListContainerProps {
  initialQueue: QueueItem[];
  selectedAY: string;
  ayList: string[];
}

export default function QueueListContainer({ initialQueue, selectedAY, ayList }: QueueListContainerProps) {
  const { isPrivacyMode } = usePrivacy();
  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [isPending, startTransition] = useTransition();

  // Decryption & Copy states
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  // Rollover status
  const [rolloverResult, setRolloverResult] = useState<string | null>(null);

  // Trigger Rollover Action
  const handleRollover = () => {
    if (confirm(`Do you want to run the automatic rollover check to enroll all previous AY clients into AY ${selectedAY}?`)) {
      startTransition(async () => {
        const res = await triggerQueueRolloverAction(selectedAY);
        if (res.error) {
          alert(res.error);
        } else {
          setRolloverResult(res.message || 'Sync complete.');
          // Reload page or trigger state update
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      });
    }
  };

  // Copy PAN + ITR Portal Password
  const handleCopyCredentials = async (item: QueueItem) => {
    setDecryptingId(item.id);
    try {
      const res = await decryptPasswordAction(item.client_id);
      if (res.error) {
        alert(res.error);
        return;
      }
      const textToCopy = `${item.clients.pan.toUpperCase()}\t${res.password}`;
      await navigator.clipboard.writeText(textToCopy);
      
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setDecryptingId(null);
    }
  };

  // WhatsApp Reminder Link Generator
  const handleWhatsAppReminder = async (item: QueueItem) => {
    try {
      await logWhatsAppActivityAction(item.client_id, item.id, item.assessment_year);
    } catch (err) {
      console.error('Failed to log WhatsApp activity:', err);
    }

    // Fetch customized template and firm name
    let template = 'Hello {client_name}, your ITR filing for AY {assessment_year} is pending. Please send us your Form 16, bank statements, and other documents at your earliest convenience to avoid last-minute rush. - {firm_name}';
    let firmName = 'SDDS';

    try {
      const templateRes = await getSystemSettingsAction('whatsapp_templates');
      if (templateRes.success && templateRes.value?.filing_reminder) {
        template = templateRes.value.filing_reminder;
      }
      const profileRes = await getSystemSettingsAction('firm_profile');
      if (profileRes.success && profileRes.value?.firmName) {
        firmName = profileRes.value.firmName;
      }
    } catch (err) {
      console.error('Failed to load system settings for WhatsApp reminder:', err);
    }

    // Replace placeholders
    const message = template
      .replace(/{client_name}/g, item.clients.name)
      .replace(/{assessment_year}/g, item.assessment_year)
      .replace(/{firm_name}/g, firmName);

    // Format Indian mobile number: prefix 91 if not present
    let rawNumber = item.clients.mobile.replace(/\D/g, '');
    if (rawNumber.length === 10) {
      rawNumber = `91${rawNumber}`;
    }
    
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Filters
  const tabs = ['All', 'Yet To File', 'Documents Pending', 'Ready to File', 'Filed', 'Under Processing', 'Processed', 'Rectification Required'];

  const filteredQueue = queue.filter(item => {
    const term = search.toLowerCase();
    const matchesSearch = 
      item.clients.name.toLowerCase().includes(term) ||
      item.clients.pan.toLowerCase().includes(term) ||
      item.clients.mobile.includes(term);

    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && item.filing_status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Upper Panel: AY selector & Rollover Trigger */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label htmlFor="queue-ay" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filing Year:
          </label>
          <div className="relative">
            <select
              id="queue-ay"
              defaultValue={selectedAY}
              // @ts-ignore
              onInput={(e) => { window.location.href = `/queue?ay=${e.target.value}`; }}
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 cursor-pointer appearance-none pr-8 min-w-[120px]"
            >
              {ayList.map(ay => (
                <option key={ay} value={ay}>{ay}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {rolloverResult && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/20 px-3 py-1.5 border border-emerald-900/40 rounded-xl animate-pulse">
              {rolloverResult}
            </span>
          )}
          <button
            onClick={handleRollover}
            disabled={isPending}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-55"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>Sync previous AY Queue</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter queue by name, PAN, or contact number..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none gap-2 select-none">
        {tabs.map((tab) => {
          const count = queue.filter(item => tab === 'All' || item.filing_status === tab).length;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 shadow-md'
                  : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Queue list table */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-semibold select-none">
              <th className="p-4">Client</th>
              <th className="p-4">PAN Number</th>
              <th className="p-4">Filing Status</th>
              <th className="p-4">ITR Type</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item) => {
                const isMasked = isPrivacyMode && !revealedIds[item.id];
                return (
                  <tr key={item.id} className="hover:bg-slate-900/25 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white">{item.clients.name}</div>
                      <div className="text-slate-400 text-xs mt-1">{maskText(item.clients.mobile, isMasked)}</div>
                    </td>
                    <td className="p-4 font-mono font-bold tracking-wide">
                      <div className="flex items-center space-x-2">
                        <span>{maskText(item.clients.pan, isMasked)}</span>
                        {isPrivacyMode && (
                          <button
                            onClick={() => setRevealedIds(p => ({ ...p, [item.id]: !p[item.id] }))}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                          >
                            {revealedIds[item.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/15">
                        {item.filing_status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">
                      {item.itr_type || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Copy credentials */}
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(item)}
                          disabled={decryptingId === item.id}
                          title="Copy Credentials"
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            copiedId === item.id
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {decryptingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          ) : copiedId === item.id ? (
                            <ClipboardCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>

                        {/* WhatsApp Follow up */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppReminder(item)}
                          title="Send WhatsApp Follow-up Reminder"
                          className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 rounded-xl transition-all cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>

                        <Link
                          href={`/clients/${item.client_id}?ay=${item.assessment_year}`}
                          className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
                        >
                          <span>Filing Portal</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500 font-medium bg-slate-950/10">
                  No pending queue workload matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
