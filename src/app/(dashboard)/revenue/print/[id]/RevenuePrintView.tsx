'use client';

import { usePrivacy } from '@/context/PrivacyContext';
import { Printer, ArrowLeft, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  pan: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
}

interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  financial_year: string;
  assessment_year: string;
  invoice_date: string;
  expected_payment_date: string;
  service_type: string;
  return_type: string | null;
  description: string | null;
  total_amount: number;
  waived_amount: number;
  amount_received: number;
  balance_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  clients?: Client | null;
}

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
}

interface RevenuePrintViewProps {
  invoice: Invoice;
  payments: Payment[];
}

export default function RevenuePrintView({ invoice, payments }: RevenuePrintViewProps) {
  const { isPrivacyMode } = usePrivacy();

  const client = invoice.clients;

  // Mask string helper
  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar (Hidden on Print) */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl print:hidden select-none">
        <Link
          href="/revenue"
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Revenue Ledger</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors shadow-lg shadow-blue-500/10"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save to PDF</span>
        </button>
      </div>

      {/* Invoice Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto text-slate-100 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full">
        {/* Subtle glow (Hidden on Print) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] print:hidden" />

        {/* Corporate Letterhead */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 print:border-slate-300 pb-8 space-y-6 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3 select-none">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center print:bg-slate-900 print:bg-none">
                <span className="text-white font-black text-xs">SD</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white print:text-black">SDDS</span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-2 font-medium">
              Single Digit Data Solutions
            </p>
            <p className="text-xs text-slate-500 print:text-slate-500 mt-1 leading-relaxed">
              Income Tax Planning & Practice Management Portal<br />
              Secure Practitioner Billing Services
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-1 font-medium">
            <h2 className="text-lg font-black text-white print:text-black tracking-wider uppercase mb-1">Tax Invoice</h2>
            <p>
              <span className="text-slate-500 font-semibold">Invoice No:</span>{' '}
              <span className="font-mono font-bold text-white print:text-black">{invoice.invoice_number}</span>
            </p>
            <p><span className="text-slate-500 font-semibold">Invoice Date:</span> {formattedDate(invoice.invoice_date)}</p>
            <p><span className="text-slate-500 font-semibold">Due Date:</span> {formattedDate(invoice.expected_payment_date)}</p>
            <p><span className="text-slate-500 font-semibold">Financial Year:</span> <span className="font-bold text-white print:text-black">{invoice.financial_year}</span></p>
            <p><span className="text-slate-500 font-semibold">Assessment Year:</span> <span className="font-bold text-white print:text-black">{invoice.assessment_year}</span></p>
          </div>
        </div>

        {/* Bill To & Status details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-800 print:border-slate-300">
          {client ? (
            <div className="space-y-1.5 text-xs text-slate-400 print:text-slate-600 font-medium">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Billed To</h3>
              <p className="text-white print:text-black font-extrabold text-sm">{client.name}</p>
              <p><span className="text-slate-500">PAN Card:</span> <span className="font-mono font-bold text-white print:text-black">{maskText(client.pan, isPrivacyMode)}</span></p>
              <p><span className="text-slate-500">Mobile:</span> {maskText(client.mobile, isPrivacyMode)}</p>
              {client.email && <p><span className="text-slate-500">Email:</span> {maskText(client.email, isPrivacyMode)}</p>}
              {client.address && <p className="leading-relaxed mt-1"><span className="text-slate-500">Address:</span> {maskText(client.address, isPrivacyMode)}</p>}
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium">Client details unavailable.</div>
          )}

          <div className="space-y-2 text-xs text-slate-400 print:text-slate-600 font-medium">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-2 font-semibold">Payment Condition</h3>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                invoice.status === 'Paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:bg-transparent print:text-black'
                  : invoice.status === 'Part Paid'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 print:bg-transparent print:text-black'
                  : invoice.status === 'Overdue'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 print:bg-transparent print:text-black'
                  : invoice.status === 'Waived'
                  ? 'bg-slate-800 text-slate-400 border-slate-700 print:bg-transparent print:text-black'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 print:bg-transparent print:text-black'
              }`}>
                {invoice.status}
              </span>
            </div>
            {payments.length > 0 && (
              <p>
                <span className="text-slate-500">Settled via:</span>{' '}
                <span className="font-semibold text-white print:text-black">
                  {Array.from(new Set(payments.map(p => p.payment_method))).join(', ')}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Itemized charges table */}
        <div className="py-8">
          <table className="w-full text-left text-xs border-collapse print:text-black">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-400 text-slate-500 uppercase tracking-wider font-bold select-none">
                <th className="pb-3 w-1/12">#</th>
                <th className="pb-3 w-7/12">Service Description</th>
                <th className="pb-3 text-right w-4/12">Fee Charged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              <tr>
                <td className="py-4">1</td>
                <td className="py-4">
                  <div className="font-bold text-white print:text-black">{invoice.service_type}</div>
                  {invoice.return_type && (
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Return Type: {invoice.return_type} (Financial Year {invoice.financial_year})
                    </div>
                  )}
                  {invoice.description && (
                    <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1 leading-relaxed whitespace-pre-line font-medium">
                      {invoice.description}
                    </p>
                  )}
                </td>
                <td className="py-4 text-right font-bold text-slate-200 print:text-black">
                  ₹{maskText(Number(invoice.total_amount).toLocaleString('en-IN'), isPrivacyMode)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div className="border-t border-slate-800 print:border-slate-300 pt-6 flex justify-end">
          <div className="w-full sm:w-1/2 space-y-2.5 text-xs text-slate-400 print:text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white print:text-black font-bold">
                ₹{maskText(Number(invoice.total_amount).toLocaleString('en-IN'), isPrivacyMode)}
              </span>
            </div>

            {Number(invoice.waived_amount) > 0 && (
              <div className="flex justify-between text-blue-400 print:text-black">
                <span>Waived Amount:</span>
                <span>-₹{maskText(Number(invoice.waived_amount).toLocaleString('en-IN'), isPrivacyMode)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Amount Received:</span>
              <span className="text-emerald-400 print:text-black font-semibold">
                ₹{maskText(Number(invoice.amount_received).toLocaleString('en-IN'), isPrivacyMode)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold border-t border-dashed border-slate-800 print:border-slate-300 pt-2 text-red-400 print:text-black">
              <span>Balance Due:</span>
              <span>₹{maskText(Number(invoice.balance_amount).toLocaleString('en-IN'), isPrivacyMode)}</span>
            </div>
          </div>
        </div>

        {/* Payments installment ledger */}
        {payments && payments.length > 0 && (
          <div className="mt-8 border-t border-slate-800 print:border-slate-300 pt-6">
            <h4 className="text-xs font-bold text-slate-400 print:text-slate-600 mb-3 uppercase tracking-wider select-none">Receipt Ledger (Manual Payments)</h4>
            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden bg-slate-950/20 print:bg-transparent">
              <table className="w-full border-collapse text-left text-xs print:text-black">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 bg-slate-900/10 text-slate-500 font-semibold select-none">
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference No</th>
                    <th className="p-3">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 print:divide-slate-200">
                  {payments.map(p => (
                    <tr key={p.id} className="text-slate-300 print:text-black font-medium">
                      <td className="p-3">{formattedDate(p.payment_date)}</td>
                      <td className="p-3 font-semibold">{p.payment_method}</td>
                      <td className="p-3 font-mono text-slate-400 print:text-slate-600">{p.reference_number || '-'}</td>
                      <td className="p-3 font-bold">₹{maskText(Number(p.amount).toLocaleString('en-IN'), isPrivacyMode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice notes (optional) */}
        {invoice.notes && (
          <div className="mt-8 border-t border-slate-800 print:border-slate-300 pt-6">
            <h4 className="text-xs font-bold text-slate-400 print:text-slate-600 mb-2 uppercase tracking-wider select-none">Invoice Remarks</h4>
            <p className="text-xs text-slate-400 print:text-slate-600 whitespace-pre-line leading-relaxed font-medium">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Corporate Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800 print:border-slate-300 text-center select-none">
          <p className="text-xs text-slate-400 print:text-slate-600 font-bold">Thank you for your business!</p>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">
            This document is a computer-generated Tax Invoice raised via the SDDS practitioner billing portal.<br />
            For any queries or modifications, please get in touch with our tax practice support.
          </p>
        </div>
      </div>
    </div>
  );
}
