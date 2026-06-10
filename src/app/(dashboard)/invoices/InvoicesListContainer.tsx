'use client';

import { useState, useMemo } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { Search, Download, Eye, EyeOff, FileText, ArrowUpRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSystemSettingsAction, logWhatsAppPaymentActivityAction } from '../clients/actions';

interface InvoiceItem {
  id: string;
  invoice_number: string;
  assessment_year: string;
  settlement_amount: number;
  amount_received: number;
  outstanding_amount: number;
  payment_status: string;
  filings: {
    client_id: string;
    clients: {
      name: string;
      pan: string;
      mobile: string;
    };
  };
}

interface InvoicesListProps {
  invoices: InvoiceItem[];
  selectedAY: string;
  ayList: string[];
}

export default function InvoicesListContainer({ invoices, selectedAY, ayList }: InvoicesListProps) {
  const router = useRouter();
  const { isPrivacyMode } = usePrivacy();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    const term = search.toLowerCase();
    return invoices.filter(item => {
      const matchesSearch = 
        item.invoice_number.toLowerCase().includes(term) ||
        item.filings.clients.name.toLowerCase().includes(term) ||
        item.filings.clients.pan.toLowerCase().includes(term);

      const matchesTab = activeTab === 'All' || item.payment_status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [invoices, search, activeTab]);

  // Mask string helper
  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    // Column headers
    const headers = [
      'Invoice Number',
      'Client Name',
      'PAN',
      'Assessment Year',
      'Total Settlement Charge',
      'Amount Received',
      'Outstanding Balance',
      'Payment Status'
    ];

    // Map rows
    const rows = filteredInvoices.map(item => [
      item.invoice_number,
      item.filings.clients.name,
      item.filings.clients.pan.toUpperCase(),
      item.assessment_year,
      item.settlement_amount,
      item.amount_received,
      item.outstanding_amount,
      item.payment_status
    ]);

    // Format content
    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SDDS_Invoices_AY_${selectedAY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppPaymentReminder = async (item: InvoiceItem) => {
    try {
      await logWhatsAppPaymentActivityAction(item.filings.client_id, item.invoice_number, item.outstanding_amount);
    } catch (err) {
      console.error('Failed to log WhatsApp payment reminder activity:', err);
    }

    // Fetch customized template and firm name
    let template = 'Hello {client_name}, this is a gentle reminder that invoice {invoice_number} of amount ₹{amount} for your ITR filing is outstanding. Kindly clear the dues as soon as possible. - {firm_name}';
    let firmName = 'SDDS';

    try {
      const templateRes = await getSystemSettingsAction('whatsapp_templates');
      if (templateRes.success && templateRes.value?.payment_reminder) {
        template = templateRes.value.payment_reminder;
      }
      const profileRes = await getSystemSettingsAction('firm_profile');
      if (profileRes.success && profileRes.value?.firmName) {
        firmName = profileRes.value.firmName;
      }
    } catch (err) {
      console.error('Failed to load system settings for WhatsApp payment reminder:', err);
    }

    // Replace placeholders
    const message = template
      .replace(/{client_name}/g, item.filings.clients.name)
      .replace(/{invoice_number}/g, item.invoice_number)
      .replace(/{amount}/g, String(item.outstanding_amount))
      .replace(/{firm_name}/g, firmName);

    // Format Indian mobile number: prefix 91 if not present
    let rawNumber = item.filings.clients.mobile.replace(/\D/g, '');
    if (rawNumber.length === 10) {
      rawNumber = `91${rawNumber}`;
    }
    
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Controls: AY selector & CSV Export */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl select-none">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label htmlFor="inv-ay" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filing Year:
          </label>
          <div className="relative">
            <select
              id="inv-ay"
              defaultValue={selectedAY}
              onChange={(e) => { router.push(`/invoices?ay=${e.target.value}`); }}
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

        <button
          onClick={handleExportCSV}
          disabled={filteredInvoices.length === 0}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/10 shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter invoices by number, client name, or PAN..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 select-none">
        {['All', 'Paid', 'Partial', 'Unpaid'].map(tab => {
          const count = invoices.filter(inv => tab === 'All' || inv.payment_status === tab).length;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-semibold select-none">
              <th className="p-4">Invoice No</th>
              <th className="p-4">Client</th>
              <th className="p-4">PAN Number</th>
              <th className="p-4">Settlement Fee</th>
              <th className="p-4">Outstanding Bal.</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map(item => {
                const isMasked = isPrivacyMode && !revealedIds[item.id];
                return (
                  <tr key={item.id} className="hover:bg-slate-900/25 transition-colors group">
                    <td className="p-4 font-mono font-bold text-white">
                      {item.invoice_number}
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      {item.filings.clients.name}
                    </td>
                    <td className="p-4 font-mono font-bold tracking-wide">
                      <div className="flex items-center space-x-2">
                        <span>{maskText(item.filings.clients.pan, isMasked)}</span>
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
                    <td className="p-4 font-bold text-slate-200">
                      ₹{maskText(Number(item.settlement_amount).toLocaleString('en-IN'), isMasked)}
                    </td>
                    <td className="p-4 font-bold text-red-400">
                      ₹{maskText(Number(item.outstanding_amount).toLocaleString('en-IN'), isMasked)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                        item.payment_status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                          : item.payment_status === 'Partial'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                          : 'bg-red-500/10 text-red-400 border-red-500/15'
                      }`}>
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {item.payment_status !== 'Paid' && (
                          <button
                            type="button"
                            onClick={() => handleWhatsAppPaymentReminder(item)}
                            title="Send WhatsApp Payment Reminder"
                            className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          href={`/invoices/${item.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all"
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-400" />
                          <span>Print Invoice</span>
                          <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500 font-medium bg-slate-950/10">
                  No invoices generated match the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
