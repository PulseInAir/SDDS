import { createClient } from '@/utils/supabase/server';
import RevenuePrintView from './RevenuePrintView';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Dynamic server rendering

interface RevenuePrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function RevenuePrintPage({ params }: RevenuePrintPageProps) {
  const resolvedParams = await params;
  const invoiceId = resolvedParams.id;
  const supabase = await createClient();

  // Fetch in parallel
  const [invoiceResult, paymentsResult] = await Promise.all([
    supabase
      .from('revenue_invoices')
      .select('*, clients(*)')
      .eq('id', invoiceId)
      .single(),
    supabase
      .from('revenue_payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: true })
  ]);

  const { data: invoice, error } = invoiceResult;
  const { data: payments } = paymentsResult;

  if (error || !invoice) {
    console.error('Revenue invoice not found:', error);
    redirect('/revenue');
  }

  return (
    <div className="py-4">
      <RevenuePrintView 
        invoice={invoice} 
        payments={payments || []} 
      />
    </div>
  );
}
