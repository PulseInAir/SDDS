import { createClient } from '@/utils/supabase/server';
import InvoicePrintView from './InvoicePrintView';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Dynamic server rendering

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const resolvedParams = await params;
  const invoiceId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Fetch Invoice Details (joining filing and client)
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, filings!inner(*, clients!inner(*))')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) {
    console.error('Invoice not found:', error);
    redirect('/invoices');
  }

  // 2. Fetch payments received for this invoice
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('payment_date', { ascending: true });

  return (
    <div className="py-4">
      <InvoicePrintView 
        invoice={invoice} 
        payments={payments || []} 
      />
    </div>
  );
}
