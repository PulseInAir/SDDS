'use client';

import { useState, useMemo } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { deleteClientsAction } from './actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Eye, EyeOff, Phone, Mail, 
  UserPlus, Calendar, Loader2, Trash2
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
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const router = useRouter();

  // Local masks for specific rows when privacy mode is ON
  const [revealedClients, setRevealedClients] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  const handleToggleSelect = (clientId: string) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(clientId);
      const nextSelected = isSelected
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId];

      if (nextSelected.length === 0) {
        setShowCheckboxes(false);
      } else {
        setShowCheckboxes(true);
      }
      return nextSelected;
    });
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredClients.map(c => c.id);
    const allVisibleSelected = visibleIds.every(id => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
      setShowCheckboxes(false);
    } else {
      setSelectedIds(prev => {
        const newSelected = [...prev];
        visibleIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
      setShowCheckboxes(true);
    }
  };

  const handleDeleteSingle = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to permanently delete client "${clientName}"? This will delete all their filings, invoices, and credentials.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteClientsAction([clientId]);
      if (res.error) {
        alert(res.error);
      } else {
        setClients(prev => prev.filter(c => c.id !== clientId));
        setSelectedIds(prev => prev.filter(id => id !== clientId));
      }
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteBulk = async () => {
    const selectedClients = clients.filter(c => selectedIds.includes(c.id));
    if (selectedClients.length === 0) return;

    if (!confirm(`Are you sure you want to permanently delete the ${selectedClients.length} selected clients? This will delete all their filings, invoices, and credentials.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteClientsAction(selectedIds);
      if (res.error) {
        alert(res.error);
      } else {
        const deletedIdsSet = new Set(selectedIds);
        setClients(prev => prev.filter(c => !deletedIdsSet.has(c.id)));
        setSelectedIds([]);
      }
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle local reveal for a specific client row
  const toggleRowReveal = (clientId: string) => {
    setRevealedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    const term = search.toLowerCase();
    return clients.filter(c => {
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
  }, [clients, search]);



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

      {/* Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-red-950/25 border border-red-900/40 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-200">
          <span className="text-xs font-bold text-red-400">
            {selectedIds.length} {selectedIds.length === 1 ? 'client' : 'clients'} selected for deletion
          </span>
          <button
            type="button"
            onClick={handleDeleteBulk}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-red-500/10 cursor-pointer disabled:opacity-50 transition-all select-none"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* Client Table List */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-semibold select-none">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={filteredClients.length > 0 && filteredClients.every(c => selectedIds.includes(c.id))}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-blue-500/40 cursor-pointer w-4 h-4"
                />
              </th>
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
              filteredClients.map((client, index) => {
                const isMasked = isPrivacyMode && !revealedClients[client.id];
                return (
                  <tr 
                    key={client.id} 
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="hover:bg-slate-900/25 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 text-center font-bold text-slate-500 select-none">
                      {showCheckboxes ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(client.id)}
                          onChange={() => handleToggleSelect(client.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-blue-500/40 cursor-pointer w-4 h-4"
                        />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white max-w-[200px] truncate">
                      {client.name}
                    </td>
                    <td className="p-4 font-mono font-bold tracking-wide">
                      <div className="flex items-center space-x-2">
                        <span>{maskText(client.pan, isMasked)}</span>
                        {isPrivacyMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowReveal(client.id);
                            }}
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
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSingle(client.id, client.name);
                          }}
                          disabled={isDeleting}
                          title="Delete Client Profile"
                          className="p-2 bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-900/50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500 font-medium bg-slate-950/10">
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
