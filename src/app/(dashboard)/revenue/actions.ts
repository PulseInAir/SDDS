'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to log user activities
async function logActivity(clientId: string, actionType: string, description: string, filingId?: string) {
  const supabase = await createClient();
  await supabase.from('activity_logs').insert({
    client_id: clientId,
    filing_id: filingId || null,
    action_type: actionType,
    description: description
  });
}

// Helper to calculate Indian Financial Year (starts April 1)
function calculateFinancialYear(dateStr: string): string {
  const dateObj = new Date(dateStr);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-indexed (Jan is 1)
  
  if (month >= 4) {
    const nextYearShort = String(year + 1).slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    const prevYear = year - 1;
    const currentYearShort = String(year).slice(-2);
    return `${prevYear}-${currentYearShort}`;
  }
}

// Helper to calculate Assessment Year from Financial Year
function calculateAssessmentYear(fy: string): string {
  const parts = fy.split('-');
  const fyStart = parseInt(parts[0], 10);
  const ayStart = fyStart + 1;
  const ayEndShort = String(ayStart + 1).slice(-2);
  return `${ayStart}-${ayEndShort}`;
}

// Generate the next sequential invoice number format: SDDS/FY2025-26/0001
async function generateNextInvoiceNumber(supabase: any, financialYear: string): Promise<string> {
  const pattern = `SDDS/FY${financialYear}/%`;
  const { data, error } = await supabase
    .from('revenue_invoices')
    .select('invoice_number')
    .like('invoice_number', pattern)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate invoice number: ${error.message}`);
  }

  let nextSeq = 1;
  if (data && data.length > 0) {
    const lastNum = data[0].invoice_number;
    const parts = lastNum.split('/');
    const lastSeqStr = parts[parts.length - 1];
    const lastSeqVal = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeqVal)) {
      nextSeq = lastSeqVal + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `SDDS/FY${financialYear}/${seqStr}`;
}

export async function createRevenueInvoiceAction(formData: {
  client_id: string;
  filing_id?: string | null;
  invoice_date: string;
  service_type: string;
  return_type?: string | null;
  description?: string | null;
  total_amount: number;
  notes?: string | null;
}) {
  try {
    const supabase = await createClient();

    const {
      client_id,
      filing_id,
      invoice_date,
      service_type,
      return_type,
      description,
      total_amount,
      notes
    } = formData;

    if (!client_id || !invoice_date || !service_type) {
      return { error: 'Client, Invoice Date, and Service Type are required.' };
    }

    if (total_amount < 0) {
      return { error: 'Fee charged cannot be negative.' };
    }

    // 1. Calculate Financial Year and Assessment Year
    const fy = calculateFinancialYear(invoice_date);
    const ay = calculateAssessmentYear(fy);

    // 2. Set expected payment date to 30 days from invoice date
    const invoiceDateObj = new Date(invoice_date);
    const expectedDateObj = new Date(invoiceDateObj.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expected_payment_date = expectedDateObj.toISOString().split('T')[0];

    // 3. Generate sequential invoice number
    const invoice_number = await generateNextInvoiceNumber(supabase, fy);

    // 4. Determine status based on amount (fallback; trigger will override if active)
    const status = total_amount === 0 ? 'Not Billed' : 'Invoice Raised';

    const { data: invoice, error } = await supabase
      .from('revenue_invoices')
      .insert({
        client_id,
        filing_id: filing_id || null,
        invoice_number,
        financial_year: fy,
        assessment_year: ay,
        invoice_date,
        expected_payment_date,
        service_type,
        return_type: return_type || null,
        description: description || null,
        total_amount,
        waived_amount: 0,
        amount_received: 0,
        balance_amount: total_amount,
        status,
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Log Activity
    await logActivity(
      client_id,
      'Revenue Invoice Created',
      `Created invoice ${invoice_number} for service ${service_type} of ₹${total_amount.toLocaleString('en-IN')}`,
      filing_id || undefined
    );

    revalidatePath('/revenue');
    return { success: true, data: invoice };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function editRevenueInvoiceAction(
  invoiceId: string,
  formData: {
    invoice_date: string;
    expected_payment_date?: string;
    service_type: string;
    return_type?: string | null;
    description?: string | null;
    total_amount: number;
    notes?: string | null;
  }
) {
  try {
    const supabase = await createClient();

    const {
      invoice_date,
      expected_payment_date,
      service_type,
      return_type,
      description,
      total_amount,
      notes
    } = formData;

    if (!invoiceId || !invoice_date || !service_type) {
      return { error: 'Invoice ID, Invoice Date, and Service Type are required.' };
    }

    if (total_amount < 0) {
      return { error: 'Fee charged cannot be negative.' };
    }

    // Calculate Financial Year & Assessment Year
    const fy = calculateFinancialYear(invoice_date);
    const ay = calculateAssessmentYear(fy);

    // If expected_payment_date is not provided, default to 30 days from new invoice date
    let finalExpectedDate = expected_payment_date;
    if (!finalExpectedDate) {
      const invoiceDateObj = new Date(invoice_date);
      const expectedDateObj = new Date(invoiceDateObj.getTime() + 30 * 24 * 60 * 60 * 1000);
      finalExpectedDate = expectedDateObj.toISOString().split('T')[0];
    }

    // Fetch existing invoice to log changes
    const { data: existing, error: fetchErr } = await supabase
      .from('revenue_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchErr) {
      return { error: `Invoice not found: ${fetchErr.message}` };
    }

    const { data: updated, error } = await supabase
      .from('revenue_invoices')
      .update({
        invoice_date,
        expected_payment_date: finalExpectedDate,
        financial_year: fy,
        assessment_year: ay,
        service_type,
        return_type: return_type || null,
        description: description || null,
        total_amount,
        notes: notes || null
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Log Activity
    await logActivity(
      updated.client_id,
      'Revenue Invoice Updated',
      `Updated invoice ${updated.invoice_number} details (New Total: ₹${total_amount.toLocaleString('en-IN')})`
    );

    revalidatePath('/revenue');
    return { success: true, data: updated };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function recordRevenuePaymentAction(formData: {
  invoice_id: string;
  client_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string | null;
  notes?: string | null;
}) {
  try {
    const supabase = await createClient();

    const {
      invoice_id,
      client_id,
      amount,
      payment_method,
      payment_date,
      reference_number,
      notes
    } = formData;

    if (!invoice_id || !client_id || !payment_method || !payment_date) {
      return { error: 'Invoice, Client, Payment Method, and Payment Date are required.' };
    }

    if (amount <= 0) {
      return { error: 'Payment amount must be greater than zero.' };
    }

    // Fetch the invoice to prevent overpayment
    const { data: invoice, error: fetchErr } = await supabase
      .from('revenue_invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (fetchErr || !invoice) {
      return { error: `Invoice not found: ${fetchErr?.message}` };
    }

    const maxAllowable = invoice.total_amount - invoice.amount_received - invoice.waived_amount;
    if (amount > maxAllowable) {
      return { error: `Payment amount ₹${amount.toLocaleString('en-IN')} exceeds remaining balance ₹${maxAllowable.toLocaleString('en-IN')}.` };
    }

    const { data: payment, error } = await supabase
      .from('revenue_payments')
      .insert({
        invoice_id,
        client_id,
        amount,
        payment_method,
        payment_date,
        reference_number: reference_number || null,
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Log Activity
    await logActivity(
      client_id,
      'Revenue Payment Recorded',
      `Recorded payment of ₹${amount.toLocaleString('en-IN')} via ${payment_method} for invoice ${invoice.invoice_number}`
    );

    revalidatePath('/revenue');
    return { success: true, data: payment };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function waiveRevenueInvoiceAction(invoiceId: string, clientId: string) {
  try {
    const supabase = await createClient();

    if (!invoiceId || !clientId) {
      return { error: 'Invoice ID and Client ID are required.' };
    }

    // Fetch invoice to compute the waived amount
    const { data: invoice, error: fetchErr } = await supabase
      .from('revenue_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchErr || !invoice) {
      return { error: `Invoice not found: ${fetchErr?.message}` };
    }

    const remaining = invoice.total_amount - invoice.amount_received - invoice.waived_amount;
    if (remaining <= 0) {
      return { error: 'Invoice is already fully settled. No outstanding balance to waive.' };
    }

    const totalWaived = invoice.waived_amount + remaining;

    const { data: updated, error } = await supabase
      .from('revenue_invoices')
      .update({
        waived_amount: totalWaived
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Log Activity
    await logActivity(
      clientId,
      'Revenue Invoice Waived',
      `Waived remaining balance of ₹${remaining.toLocaleString('en-IN')} for invoice ${invoice.invoice_number}`
    );

    revalidatePath('/revenue');
    return { success: true, data: updated };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteRevenueInvoiceAction(invoiceId: string, clientId: string) {
  try {
    const supabase = await createClient();

    if (!invoiceId || !clientId) {
      return { error: 'Invoice ID and Client ID are required.' };
    }

    // Fetch invoice info for logging
    const { data: invoice, error: fetchErr } = await supabase
      .from('revenue_invoices')
      .select('invoice_number')
      .eq('id', invoiceId)
      .single();

    const invNum = invoice?.invoice_number || invoiceId;

    const { error } = await supabase
      .from('revenue_invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      return { error: error.message };
    }

    // Log Activity
    await logActivity(
      clientId,
      'Revenue Invoice Deleted',
      `Deleted invoice ${invNum}`
    );

    revalidatePath('/revenue');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
