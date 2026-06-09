'use client';

import { useState } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { decryptPasswordAction } from './actions';
import Link from 'next/link';
import { 
  Search, Eye, EyeOff, Copy, Phone, Mail, 
  UserPlus, Calendar, ClipboardCheck, ArrowUpRight, Loader2
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  pan: string;
  mobile: string;
  email: string | null;
  dob: string;
  family_group: string | null;
  filings?: {
    acknowledgement_number: string | null;
    invoices: {
      invoice_number: string;
    } | any[] | null;
  }[];
}

export default function ClientListContainer({ initialClients }: { initialClients: Client[] }) {
  const { isPrivacyMode } = usePrivacy();
  const [clients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');

  // Local masks for specific rows when privacy mode is ON
  const [revealedClients, setRevealedClients] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  // Toggle local reveal for a specific client row
  const toggleRowReveal = (clientId: string) => {
    setRevealedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    const term = search.toLowerCase();
    
    // Check nested filings & invoices
    const matchesAck = c.filings?.some(f => f.acknowledgement_number?.toLowerCase().includes(term)) || false;
    const matchesInv = c.filings?.some(f => {
      if (!f.invoices) return false;
      if (Array.isArray(f.invoices)) {
        return f.invoices.some((inv: any) => inv.invoice_number?.toLowerCase().includes(term));
      }
      return (f.invoices as any).invoice_number?.toLowerCase().includes(term);
    }) || false;

    return (
      c.name.toLowerCase().includes(term) ||
      c.pan.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      matchesAck ||
      matchesInv
    );
  });

  // Handle Clipboard Copy of PAN & Password
  const handleCopyCredentials = async (client: Client) => {
    setDecryptingId(client.id);
    try {
      const res = await decryptPasswordAction(client.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      
      const textToCopy = `${client.pan.toUpperCase()}\t${res.password}`;
      await navigator.clipboard.writeText(textToCopy);
      
      setCopiedId(client.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy credentials failed:', err);
    } finally {
      setDecryptingId(null);
    }
  };

  // Mask string helper
  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };

  // Format date utility
  const formatDOB = (dobString: string) => {
    if (!dobString) return '-';
    // Split date assuming it is stored as YYYY-MM-DD
    const parts = dobString.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    }
    return new Date(dobString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search & Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, PAN, or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
        </div>

        <Link
          href="/clients/new"
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/10 shrink-0 select-none"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Client</span>
        </Link>
      </div>

      {/* Client Table List */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-semibold select-none">
              <th className="p-4">Name</th>
              <th className="p-4">PAN Number</th>
              <th className="p-4">Date of Birth</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Family Group</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-880">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const isMasked = isPrivacyMode && !revealedClients[client.id];
                return (
                  <tr key={client.id} className="hover:bg-slate-900/25 transition-colors group">
                    <td className="p-4 font-bold text-white max-w-[200px] truncate">
                      {client.name}
                    </td>
                    <td className="p-4 font-mono font-bold tracking-wide">
                      <div className="flex items-center space-x-2">
                        <span>{maskText(client.pan, isMasked)}</span>
                        {isPrivacyMode && (
                          <button
                            type="button"
                            onClick={() => toggleRowReveal(client.id)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                          >
                            {revealedClients[client.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>
                          {isMasked 
                            ? '••••••••••' 
                            : formatDOB(client.dob)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{maskText(client.mobile, isMasked)}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center space-x-2 text-slate-400 text-xs">
                          <Mail className="h-3 w-3 text-slate-600 shrink-0" />
                          <span className="truncate max-w-[150px]">{maskText(client.email, isMasked)}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {client.family_group || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(client)}
                          disabled={decryptingId === client.id}
                          title="Copy Portal Login Credentials (PAN + Password)"
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            copiedId === client.id
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {decryptingId === client.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          ) : copiedId === client.id ? (
                            <ClipboardCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>

                        <Link
                          href={`/clients/${client.id}`}
                          className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
                        >
                          <span>Open Profile</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 font-medium bg-slate-950/10">
                  No clients found matching the query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
