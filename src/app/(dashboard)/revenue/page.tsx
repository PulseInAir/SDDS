import { createClient } from '@/utils/supabase/server';
import RevenueClient from '@/ui/views/revenue/RevenueClient';

export const revalidate = 0; // Dynamic server rendering

export default async function RevenuePage() {
  const supabase = await createClient();

  // Fetch in parallel
  const [clientsRes, invoicesRes, paymentsRes, filingsRes] = await Promise.all([
    supabase.from('clients').select('id, name, pan, mobile').order('name', { ascending: true }),
    supabase.from('revenue_invoices').select('*, clients(name, pan, mobile)').order('created_at', { ascending: false }),
    supabase.from('revenue_payments').select('*, clients(name), revenue_invoices(invoice_number)').order('payment_date', { ascending: false }),
    supabase.from('filings').select('id, assessment_year, client_id, itr_type, filing_status, return_type').order('created_at', { ascending: false })
  ]);

  if (invoicesRes.error && invoicesRes.error.message.includes('relation "public.revenue_invoices" does not exist')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Revenue / Collections</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage practice collections, billing, and partial payments.
          </p>
        </div>
        <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto mt-12 space-y-4">
          <div className="text-red-400 text-5xl font-light">⚠️ Schema Setup Required</div>
          <p className="text-slate-300 text-sm leading-relaxed">
            The database tables for the Revenue / Collections module have not been created yet.
            Please copy the contents of <code className="bg-slate-800 text-red-300 px-2 py-1 rounded">revenue_schema.sql</code> and run them in your **Supabase Dashboard SQL Editor** to initialize the module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Revenue / Collections</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track revenue, raise invoices, record payments, and analyze practice KPIs.
        </p>
      </div>

      <RevenueClient 
        clients={clientsRes.data || []}
        invoices={invoicesRes.data || []}
        payments={paymentsRes.data || []}
        filings={filingsRes.data || []}
      />
    </div>
  );
}
