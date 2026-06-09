'use client';

import { useState, useTransition } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { createClientAction, decryptPasswordAction } from './actions';
import Link from 'next/link';
import { 
  Search, Eye, EyeOff, Copy, Plus, Phone, Mail, 
  UserPlus, X, Loader2, Calendar, ClipboardCheck, ArrowUpRight 
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Local masks for specific rows when privacy mode is ON
  const [revealedClients, setRevealedClients] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  const [panInput, setPanInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordManual, setIsPasswordManual] = useState(false);

  const handleOpenModal = () => {
    setPanInput('');
    setPasswordInput('');
    setIsPasswordManual(false);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setPanInput(val);
    
    if (!isPasswordManual) {
      if (val.length === 10) {
        const firstFive = val.substring(0, 5).toLowerCase();
        const numbers = val.substring(5, 9);
        const lastOne = val.substring(9, 10).toUpperCase();
        setPasswordInput(`${firstFive}*${numbers}${lastOne}`);
      } else {
        setPasswordInput('');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
    setIsPasswordManual(true);
  };

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
      
      // Copy formatted: PAN [TAB] Password (or space) as requested
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

  // Handle Client Creation Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createClientAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Client added successfully and enrolled in current AY filing queue!');
        // Refresh local state list
        const newClientRecord: Client = {
          id: res.clientId!,
          name: formData.get('name') as string,
          pan: (formData.get('pan') as string).toUpperCase().trim(),
          mobile: formData.get('mobile') as string,
          email: (formData.get('email') as string) || null,
          dob: formData.get('dob') as string,
          family_group: (formData.get('family_group') as string) || null
        };
        setClients(prev => [newClientRecord, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        
        // Reset form
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(null);
        }, 1500);
      }
    });
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

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors shadow-lg shadow-blue-500/10 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Client</span>
        </button>
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
          <tbody className="divide-y divide-slate-800/50">
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
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
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
                            : new Date(client.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                        {/* Copy Login Credentials Action */}
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

      {/* Add Client Slide-Over Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Add New Client Record</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form elements */}
              <form id="add-client-form" onSubmit={handleSubmit} className="py-6 space-y-5">
                {error && (
                  <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-xl text-red-200 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-emerald-200 text-sm">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g., Rahul Sharma"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      PAN Number (10 chars) *
                    </label>
                    <input
                      type="text"
                      name="pan"
                      required
                      maxLength={10}
                      value={panInput}
                      onChange={handlePanChange}
                      placeholder="e.g., ABCDE1234F"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase tracking-wide text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Date of Birth (DOB) *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      required
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="e.g., 9876543210"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g., client@email.com"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      name="aadhaar"
                      placeholder="e.g., 1234 5678 9012"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Family Group Name
                    </label>
                    <input
                      type="text"
                      name="family_group"
                      placeholder="e.g., Sharma Family"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    ITR Portal Password *
                  </label>
                  <input
                    type="text"
                    name="password"
                    required
                    value={passwordInput}
                    onChange={handlePasswordChange}
                    placeholder="Portal password to encrypt in DB"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Residential Address
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    placeholder="Residential address details..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-client-form"
                disabled={isPending}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-blue-500/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Add Client</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
