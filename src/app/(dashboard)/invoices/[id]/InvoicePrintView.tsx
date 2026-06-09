'use client';

import { usePrivacy } from '@/context/PrivacyContext';
import { Printer, ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface InvoicePrintViewProps {
  invoice: any;
  payments: any[];
}

export default function InvoicePrintView({ invoice, payments }: InvoicePrintViewProps) {
  const { isPrivacyMode } = usePrivacy();

  const filing = invoice.filings;
  const client = filing.clients;

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
          href="/invoices"
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Invoices</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors shadow-lg shadow-blue-500/10"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save to PDF</span>
        </button>
      </div>

      {/* Invoice Sheet Sheet */}
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
              Secure Corporate Filing Operations
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-1 font-medium">
            <h2 className="text-lg font-black text-white print:text-black tracking-wider uppercase mb-1">Tax Invoice</h2>
            <p><span className="text-slate-500 font-semibold">Invoice No:</span> <span className="font-mono font-bold text-white print:text-black">{invoice.invoice_number}</span></p>
            <p><span className="text-slate-500 font-semibold">Invoice Date:</span> {formattedDate(invoice.created_at)}</p>
            <p><span className="text-slate-500 font-semibold">Assessment Year:</span> <span className="font-bold text-white print:text-black">{invoice.assessment_year}</span></p>
          </div>
        </div>

        {/* Bill To & Operations details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-800 print:border-slate-300">
          <div className="space-y-1.5 text-xs text-slate-400 print:text-slate-600 font-medium">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Billed To</h3>
            <p className="text-white print:text-black font-extrabold text-sm">{client.name}</p>
            <p><span className="text-slate-500">PAN Card:</span> <span className="font-mono font-bold text-white print:text-black">{maskText(client.pan, isPrivacyMode)}</span></p>
            <p><span className="text-slate-500">Mobile:</span> {maskText(client.mobile, isPrivacyMode)}</p>
            {client.email && <p><span className="text-slate-500">Email:</span> {maskText(client.email, isPrivacyMode)}</p>}
            {client.address && <p className="leading-relaxed mt-1"><span className="text-slate-500">Address:</span> {maskText(client.address, isPrivacyMode)}</p>}
          </div>

          <div className="space-y-1.5 text-xs text-slate-400 print:text-slate-600 font-medium">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-2">ITR Operation Metadata</h3>
            <p><span className="text-slate-500">ITR Return Form:</span> <span className="font-bold text-white print:text-black">{filing.itr_type || 'ITR-1'}</span></p>
            <p><span className="text-slate-500">Return Type:</span> {filing.return_type} {filing.revision_number > 0 ? `(Rev. ${filing.revision_number})` : ''}</p>
            <p><span className="text-slate-500">Acknowledgement No:</span> <span className="font-mono">{filing.acknowledgement_number || '-'}</span></p>
            {filing.filing_date && <p><span className="text-slate-500">Filing Date:</span> {formattedDate(filing.filing_date)}</p>}
          </div>
        </div>

        {/* Itemized charges table */}
        <div className="py-8">
          <table className="w-full text-left text-xs border-collapse print:text-black">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-400 text-slate-500 uppercase tracking-wider font-bold select-none">
                <th className="pb-3 w-1/12">#</th>
                <th className="pb-3 w-7/12">Fee Description</th>
                <th className="pb-3 text-right w-4/12">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {/* Item 1: Filing charge */}
              <tr>
                <td className="py-4">1</td>
                <td className="py-4">
                  <div className="font-bold text-white print:text-black">ITR Filing & E-Verification Charge</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 normal-case font-medium">Professional service fee for tax filing computation and CPC validation.</div>
                </td>
                <td className="py-4 text-right font-bold text-slate-200 print:text-black">
                  ₹{maskText(Number(invoice.filing_charge).toLocaleString('en-IN'), isPrivacyMode)}
                </td>
              </tr>

              {/* Item 2: Refund charge (conditional) */}
              {Number(invoice.refund_charge_pct) > 0 && (
                <tr>
                  <td className="py-4">2</td>
                  <td className="py-4">
                    <div className="font-bold text-white print:text-black">Refund Processing Surcharge</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 normal-case font-medium">
                      Commission fee determined at {invoice.refund_charge_pct}% of total refund amount ₹{maskText(Number(filing.refund_amount || 0).toLocaleString('en-IN'), isPrivacyMode)}.
                    </div>
                  </td>
                  <td className="py-4 text-right font-bold text-slate-200 print:text-black">
                    ₹{maskText(Number(invoice.refund_charge).toLocaleString('en-IN'), isPrivacyMode)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div className="border-t border-slate-800 print:border-slate-300 pt-6 flex justify-end">
          <div className="w-full sm:w-1/2 space-y-2.5 text-xs text-slate-400 print:text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white print:text-black font-bold">
                ₹{maskText(Number(invoice.invoice_amount).toLocaleString('en-IN'), isPrivacyMode)}
              </span>
            </div>

            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-blue-400 print:text-black">
                <span>Loyalty Discount:</span>
                <span>-₹{maskText(Number(invoice.discount).toLocaleString('en-IN'), isPrivacyMode)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm border-t border-slate-800 print:border-slate-350 pt-2 font-bold text-white print:text-black">
              <span>Total Settlement Due:</span>
              <span>₹{maskText(Number(invoice.settlement_amount).toLocaleString('en-IN'), isPrivacyMode)}</span>
            </div>

            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Total Amount Paid:</span>
              <span className="text-emerald-400 print:text-black font-semibold">
                ₹{maskText(Number(invoice.amount_received).toLocaleString('en-IN'), isPrivacyMode)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold border-t border-dashed border-slate-800 print:border-slate-300 pt-2 text-red-400 print:text-black">
              <span>Outstanding Balance Due:</span>
              <span>₹{maskText(Number(invoice.outstanding_amount).toLocaleString('en-IN'), isPrivacyMode)}</span>
            </div>
          </div>
        </div>

        {/* Payments installment ledger */}
        {payments && payments.length > 0 && (
          <div className="mt-8 border-t border-slate-800 print:border-slate-300 pt-6">
            <h4 className="text-xs font-bold text-slate-400 print:text-slate-600 mb-3 uppercase tracking-wider select-none">Receipt Ledger (Manual Installments)</h4>
            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden bg-slate-950/20 print:bg-transparent">
              <table className="w-full border-collapse text-left text-xs print:text-black">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 bg-slate-900/10 text-slate-500 font-semibold select-none">
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Amount Received</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 print:divide-slate-200">
                  {payments.map(p => (
                    <tr key={p.id} className="text-slate-300 print:text-black font-medium">
                      <td className="p-3">{formattedDate(p.payment_date)}</td>
                      <td className="p-3 font-semibold">{p.payment_mode}</td>
                      <td className="p-3 font-bold">₹{maskText(Number(p.amount).toLocaleString('en-IN'), isPrivacyMode)}</td>
                      <td className="p-3 text-slate-400 print:text-slate-500">{p.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes / Footer */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 print:border-slate-300 text-[10px] text-slate-500 print:text-slate-400 leading-relaxed font-medium">
          <p className="font-bold text-slate-400 print:text-slate-500 mb-1">Declarations & Notes:</p>
          <ul className="list-disc pl-4 space-y-0.5 select-none">
            <li>This is a computer-generated invoice for tax planning services rendered. No signature is required.</li>
            <li>Terms: Payment is settled manually via Cash or bank transfer (UPI) directly to SDDS accounts.</li>
            <li>For any queries, please email sdds.support or call directly. Thank you for your continued business!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
