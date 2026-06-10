'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '@/utils/crypto';
import { getCurrentAssessmentYear } from '@/utils/ay';
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

function generateDefaultPassword(pan: string): string {
  const cleanPan = pan.toUpperCase().trim();
  if (cleanPan.length === 10) {
    const firstFive = cleanPan.substring(0, 5).toLowerCase();
    const numbers = cleanPan.substring(5, 9);
    const lastOne = cleanPan.substring(9, 10).toUpperCase();
    return `${firstFive}*${numbers}${lastOne}`;
  }
  return `${cleanPan.toLowerCase()}*1234`;
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const pan = (formData.get('pan') as string).toUpperCase().trim();
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string;
  const dob = formData.get('dob') as string;
  const aadhaar = formData.get('aadhaar') as string;
  const address = formData.get('address') as string;
  const family_group = formData.get('family_group') as string;
  const password = formData.get('password') as string; // Plaintext to encrypt

  const finalPassword = password ? password.trim() : '';

  if (!name || !pan || !mobile || !dob || !finalPassword) {
    return { error: 'Name, PAN, Mobile, DOB, and ITR Portal Password are required.' };
  }

  // 1. PAN validation (exactly 10 chars: 5 letters, 4 digits, 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    return { error: 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F: 5 letters, 4 numbers, 1 letter).' };
  }

  // 2. Mobile validation (exactly 10 digits)
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    return { error: 'Invalid Mobile number. Must be exactly 10 digits (e.g. 9876543210).' };
  }

  // 3. DOB validation (DD-MM-YYYY or YYYY-MM-DD)
  const dobRegexYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;
  const dobRegexDDMMYYYY = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  
  let parsedDob = dob.trim();
  if (dobRegexDDMMYYYY.test(parsedDob)) {
    const [d, m, y] = parsedDob.split('-');
    parsedDob = `${y}-${m}-${d}`;
  } else if (!dobRegexYYYYMMDD.test(parsedDob)) {
    return { error: 'Invalid Date of Birth format. Must be DD-MM-YYYY (e.g. 31-01-1990).' };
  }

  // 4. Aadhaar validation (if provided, must be exactly 12 digits)
  const cleanAadhaar = aadhaar ? aadhaar.replace(/\s/g, '') : '';
  if (cleanAadhaar) {
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(cleanAadhaar)) {
      return { error: 'Invalid Aadhaar number. Must be exactly 12 digits.' };
    }
  }

  // 1. Insert Client Profile
  const { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert({
      name,
      pan,
      email: email || null,
      mobile,
      dob: parsedDob,
      aadhaar: cleanAadhaar || null,
      address: address || null,
      family_group: family_group || null
    })
    .select()
    .single();

  if (clientError || !newClient) {
    return { error: `Client creation failed: ${clientError?.message || 'Unknown error'}` };
  }

  const clientId = newClient.id;

  // 2. Encrypt and save ITR password
  const encryptedPassword = encrypt(finalPassword);
  const { error: secretsError } = await supabase
    .from('client_secrets')
    .insert({
      client_id: clientId,
      encrypted_password: encryptedPassword
    });

  if (secretsError) {
    // Cleanup client if secret write fails
    await supabase.from('clients').delete().eq('id', clientId);
    return { error: `ITR Secret registration failed: ${secretsError.message}` };
  }

  // 3. Auto-enroll in the current Assessment Year filing queue
  const currentAY = getCurrentAssessmentYear();
  const { data: newFiling, error: filingError } = await supabase
    .from('filings')
    .insert({
      client_id: clientId,
      assessment_year: currentAY,
      filing_status: 'Yet To File',
      intimation_status: 'Not Received'
    })
    .select()
    .single();

  if (filingError) {
    console.error('Filing auto-enrollment failed:', filingError.message);
  } else {
    // 4. Create an empty invoice for the filing (Serial numbering resets per AY)
    // Find the next serial number for this AY
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('serial_number')
      .eq('assessment_year', currentAY)
      .order('serial_number', { ascending: false })
      .limit(1);

    const nextSerial = (lastInvoice?.[0]?.serial_number || 0) + 1;
    const serialStr = String(nextSerial).padStart(3, '0');
    const invoiceNumber = `SDDS/ITR/${currentAY}/${serialStr}`;

    await supabase.from('invoices').insert({
      filing_id: newFiling.id,
      invoice_number: invoiceNumber,
      serial_number: nextSerial,
      assessment_year: currentAY,
      filing_charge: 0,
      settlement_amount: 0,
      outstanding_amount: 0,
      payment_status: 'Unpaid'
    });
  }

  // 5. Log actions in timeline
  await logActivity(clientId, 'Client Added', `Client profile successfully created with PAN ${pan}.`);
  await logActivity(clientId, 'Filing Enrolled', `Filing automatically enrolled in queue for Assessment Year ${currentAY}.`, newFiling?.id);

  revalidatePath('/clients');
  revalidatePath('/');
  return { success: true, clientId };
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string;
  const dob = formData.get('dob') as string;
  const aadhaar = formData.get('aadhaar') as string;
  const address = formData.get('address') as string;
  const family_group = formData.get('family_group') as string;
  const is_excluded_from_queue = formData.get('is_excluded_from_queue') === 'true';
  const password = formData.get('password') as string; // Optional password update

  if (!name || !mobile || !dob) {
    return { error: 'Name, Mobile, and Date of Birth are required.' };
  }

  // 1. Mobile validation (exactly 10 digits)
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    return { error: 'Invalid Mobile number. Must be exactly 10 digits (no country code).' };
  }

  // 2. DOB validation (DD-MM-YYYY or YYYY-MM-DD)
  const dobRegexYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;
  const dobRegexDDMMYYYY = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  
  let parsedDob = dob.trim();
  if (dobRegexDDMMYYYY.test(parsedDob)) {
    const [d, m, y] = parsedDob.split('-');
    parsedDob = `${y}-${m}-${d}`;
  } else if (!dobRegexYYYYMMDD.test(parsedDob)) {
    return { error: 'Invalid Date of Birth format. Must be DD-MM-YYYY (e.g. 31-01-1990).' };
  }

  // 3. Aadhaar validation (if provided, must be exactly 12 digits)
  const cleanAadhaar = aadhaar ? aadhaar.replace(/\s/g, '') : '';
  if (cleanAadhaar) {
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(cleanAadhaar)) {
      return { error: 'Invalid Aadhaar number. Must be exactly 12 digits.' };
    }
  }

  // 1. Update Profile
  const { error: updateError } = await supabase
    .from('clients')
    .update({
      name,
      email: email || null,
      mobile,
      dob: parsedDob,
      aadhaar: cleanAadhaar || null,
      address: address || null,
      family_group: family_group || null,
      is_excluded_from_queue
    })
    .eq('id', clientId);

  if (updateError) {
    return { error: `Update failed: ${updateError.message}` };
  }

  // 2. Update password if provided
  if (password && password.trim().length > 0) {
    const encryptedPassword = encrypt(password);
    const { error: secretsError } = await supabase
      .from('client_secrets')
      .upsert({
        client_id: clientId,
        encrypted_password: encryptedPassword
      });

    if (secretsError) {
      return { error: `ITR Secret update failed: ${secretsError.message}` };
    }
    await logActivity(clientId, 'Password Changed', 'ITR Portal password updated.');
  }

  await logActivity(clientId, 'Profile Updated', 'Client personal details updated.');

  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/clients');
  revalidatePath('/');
  return { success: true };
}

export async function decryptPasswordAction(clientId: string) {
  const supabase = await createClient();
  
  // Make sure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: secretData } = await supabase
    .from('client_secrets')
    .select('encrypted_password')
    .eq('client_id', clientId)
    .single();

  if (!secretData) {
    return { error: 'No ITR credentials found for this client.' };
  }

  const decrypted = decrypt(secretData.encrypted_password);
  return { password: decrypted };
}

// ----------------------------------------------------
// NEW DETAILED ACTIONS (PAYMENTS, NOTES, FILING RECALCULATIONS)
// ----------------------------------------------------

export async function recalculateInvoice(invoiceId: string) {
  const supabase = await createClient();

  // Get invoice details with filing
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, filings(*)')
    .eq('id', invoiceId)
    .single();

  if (!invoice) return;

  const filingCharge = Number(invoice.filing_charge || 0);
  const refundChargePct = Number(invoice.refund_charge_pct || 0);
  const discount = Number(invoice.discount || 0);

  // Get filing's refund_amount
  // @ts-ignore
  const refundAmount = Number(invoice.filings?.refund_amount || 0);

  // Billing Math
  const refundCharge = refundAmount * (refundChargePct / 100);
  const invoiceAmount = filingCharge + refundCharge;
  const settlementAmount = Math.max(0, invoiceAmount - discount);

  // Get total payments received
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId);

  const amountReceived = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
  const outstandingAmount = Math.max(0, settlementAmount - amountReceived);

  let paymentStatus = 'Unpaid';
  if (outstandingAmount <= 0 && settlementAmount > 0) {
    paymentStatus = 'Paid';
  } else if (amountReceived > 0) {
    paymentStatus = 'Partial';
  }

  await supabase
    .from('invoices')
    .update({
      refund_charge: refundCharge,
      invoice_amount: invoiceAmount,
      settlement_amount: settlementAmount,
      amount_received: amountReceived,
      outstanding_amount: outstandingAmount,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);
}

export async function recordPaymentAction(
  invoiceId: string,
  amount: number,
  paymentMode: string,
  paymentDate: string,
  notes: string,
  clientId: string
) {
  const supabase = await createClient();

  if (!invoiceId || !amount || !paymentMode || !paymentDate) {
    return { error: 'Invoice ID, Amount, Mode, and Date are required.' };
  }

  // 1. Insert payment record
  const { error: payError } = await supabase
    .from('payments')
    .insert({
      invoice_id: invoiceId,
      amount,
      payment_mode: paymentMode,
      payment_date: paymentDate,
      notes: notes || null
    });

  if (payError) {
    return { error: `Failed to record payment: ${payError.message}` };
  }

  // 2. Recalculate invoice details
  await recalculateInvoice(invoiceId);

  // 3. Log activity
  await logActivity(
    clientId,
    'Payment Received',
    `Received payment installment of ₹${amount} via ${paymentMode}. Notes: ${notes || 'none'}`
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/invoices');
  revalidatePath('/');
  return { success: true };
}

export async function addNoteAction(clientId: string, text: string) {
  if (!clientId || !text || text.trim().length === 0) {
    return { error: 'Note text cannot be empty.' };
  }

  await logActivity(clientId, 'Note Added', text);
  
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function updateFilingStatusAction(clientId: string, filingId: string, details: {
  filing_status: string;
  itr_type?: string;
  filing_date?: string;
  acknowledgement_number?: string;
  refund_amount?: number;
  refund_status?: string;
  refund_received_date?: string;
  intimation_status?: string;
  // Invoice adjustments
  filing_charge?: number;
  refund_charge_pct?: number;
  discount?: number;
}) {
  const supabase = await createClient();

  // 1. Get original filing details to check for changes
  const { data: oldFiling } = await supabase
    .from('filings')
    .select('*')
    .eq('id', filingId)
    .single();

  if (!oldFiling) {
    return { error: 'Filing record not found.' };
  }

  // 2. Update filing
  const { error: filingError } = await supabase
    .from('filings')
    .update({
      filing_status: details.filing_status,
      itr_type: details.itr_type || null,
      filing_date: details.filing_date || null,
      acknowledgement_number: details.acknowledgement_number || null,
      refund_amount: details.refund_amount || 0.00,
      refund_status: details.refund_status || 'Yet to receive',
      refund_received_date: details.refund_received_date || null,
      intimation_status: details.intimation_status || 'Not Received',
      updated_at: new Date().toISOString()
    })
    .eq('id', filingId);

  if (filingError) {
    return { error: `Failed to update filing: ${filingError.message}` };
  }

  // Log timeline triggers dynamically based on changed values:
  if (oldFiling.filing_status !== details.filing_status) {
    await logActivity(clientId, 'Status Changed', `ITR filing status updated to: ${details.filing_status}`, filingId);
  }
  if (details.filing_status === 'Filed' && oldFiling.filing_status !== 'Filed') {
    await logActivity(clientId, 'ITR Filed', `Income Tax Return filed for AY ${oldFiling.assessment_year}.`, filingId);
  }
  if (details.acknowledgement_number && oldFiling.acknowledgement_number !== details.acknowledgement_number) {
    await logActivity(clientId, 'Ack Added', `ITR Acknowledgement Number added: ${details.acknowledgement_number}`, filingId);
  }
  if (details.intimation_status && oldFiling.intimation_status !== details.intimation_status) {
    await logActivity(clientId, 'Intimation Received', `Intimation status changed to: ${details.intimation_status}`, filingId);
  }
  if (details.refund_amount && Number(oldFiling.refund_amount) !== Number(details.refund_amount)) {
    await logActivity(clientId, 'Refund Determined', `Refund details updated. Refund amount: ₹${details.refund_amount}`, filingId);
  }

  // 3. Update associated Invoice fields
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('filing_id', filingId)
    .single();

  if (invoice) {
    // Update charges on invoice
    await supabase
      .from('invoices')
      .update({
        filing_charge: details.filing_charge || 0.00,
        refund_charge_pct: details.refund_charge_pct || 0.00,
        discount: details.discount || 0.00,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    // Recalculate
    await recalculateInvoice(invoice.id);
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/queue');
  revalidatePath('/invoices');
  revalidatePath('/');
  return { success: true };
}

export async function createFilingForAYAction(clientId: string, assessmentYear: string) {
  const supabase = await createClient();

  if (!clientId || !assessmentYear) {
    return { error: 'Client ID and Assessment Year are required.' };
  }

  // Check if filing already exists
  const { data: existing } = await supabase
    .from('filings')
    .select('id')
    .eq('client_id', clientId)
    .eq('assessment_year', assessmentYear)
    .maybeSingle();

  if (existing) {
    return { error: 'Filing for this Assessment Year already exists.' };
  }

  // Create filing
  const { data: newFiling, error: filingError } = await supabase
    .from('filings')
    .insert({
      client_id: clientId,
      assessment_year: assessmentYear,
      filing_status: 'Yet To File',
      intimation_status: 'Not Received'
    })
    .select()
    .single();

  if (filingError) {
    return { error: `Failed to start filing: ${filingError.message}` };
  }

  // Create empty invoice
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('serial_number')
    .eq('assessment_year', assessmentYear)
    .order('serial_number', { ascending: false })
    .limit(1);

  const nextSerial = (lastInvoice?.[0]?.serial_number || 0) + 1;
  const serialStr = String(nextSerial).padStart(3, '0');
  const invoiceNumber = `SDDS/ITR/${assessmentYear}/${serialStr}`;

  await supabase.from('invoices').insert({
    filing_id: newFiling.id,
    invoice_number: invoiceNumber,
    serial_number: nextSerial,
    assessment_year: assessmentYear,
    filing_charge: 0,
    settlement_amount: 0,
    outstanding_amount: 0,
    payment_status: 'Unpaid'
  });

  await logActivity(clientId, 'Filing Enrolled', `Started dynamic filing workflow for Assessment Year ${assessmentYear}.`, newFiling.id);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/queue');
  revalidatePath('/invoices');
  revalidatePath('/');
  return { success: true };
}

export async function triggerQueueRolloverAction(currentAY: string) {
  const supabase = await createClient();

  // 1. Calculate previous AY
  const parts = currentAY.split('-');
  if (parts.length !== 2) return { error: 'Invalid Assessment Year format.' };
  const prevStart = parseInt(parts[0]) - 1;
  const prevEndShort = String(prevStart + 1).slice(-2);
  const previousAY = `${prevStart}-${prevEndShort}`;

  // 2. Fetch all clients who had filings in the previous AY and are NOT excluded
  const { data: prevFilings } = await supabase
    .from('filings')
    .select('client_id, clients!inner(is_excluded_from_queue)')
    .eq('assessment_year', previousAY)
    .eq('clients.is_excluded_from_queue', false);

  if (!prevFilings || prevFilings.length === 0) {
    return { success: true, count: 0, message: `No clients found in previous AY (${previousAY}) to rollover.` };
  }

  const prevClientIds = prevFilings.map(f => f.client_id);

  // 3. Fetch clients who already have filings in the current AY
  const { data: currentFilings } = await supabase
    .from('filings')
    .select('client_id')
    .eq('assessment_year', currentAY);

  const currentClientIds = new Set(currentFilings?.map(f => f.client_id) || []);

  // 4. Find client IDs that need to be rolled over
  const missingClientIds = prevClientIds.filter(id => !currentClientIds.has(id));

  if (missingClientIds.length === 0) {
    return { success: true, count: 0, message: 'All active clients are already rolled over.' };
  }

  let count = 0;
  // 5. Enroll each missing client in the queue
  for (const clientId of missingClientIds) {
    // Start filing record
    const { data: filing, error: fErr } = await supabase
      .from('filings')
      .insert({
        client_id: clientId,
        assessment_year: currentAY,
        filing_status: 'Yet To File',
        intimation_status: 'Not Received'
      })
      .select()
      .single();

    if (fErr) {
      console.error(`Rollover failed for client ${clientId}:`, fErr.message);
      continue;
    }

    // Create empty invoice
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('serial_number')
      .eq('assessment_year', currentAY)
      .order('serial_number', { ascending: false })
      .limit(1);

    const nextSerial = (lastInvoice?.[0]?.serial_number || 0) + 1;
    const serialStr = String(nextSerial).padStart(3, '0');
    const invoiceNumber = `SDDS/ITR/${currentAY}/${serialStr}`;

    await supabase.from('invoices').insert({
      filing_id: filing.id,
      invoice_number: invoiceNumber,
      serial_number: nextSerial,
      assessment_year: currentAY,
      filing_charge: 0,
      settlement_amount: 0,
      outstanding_amount: 0,
      payment_status: 'Unpaid'
    });

    // Log activity
    await logActivity(clientId, 'Filing Enrolled', `Client automatically rolled over into AY ${currentAY} filing queue from previous year.`, filing.id);
    count++;
  }

  revalidatePath('/queue');
  revalidatePath('/');
  return { success: true, count, message: `Successfully rolled over ${count} clients into current Assessment Year.` };
}

function sanitizeFilename(filename: string): string {
  const baseName = filename.split(/[\\/]/).pop() || '';
  const dotIndex = baseName.lastIndexOf('.');
  let name = dotIndex !== -1 ? baseName.substring(0, dotIndex) : baseName;
  const ext = dotIndex !== -1 ? baseName.substring(dotIndex) : '';
  
  name = name
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special characters with underscore
    .replace(/_+/g, '_')             // Collapse multiple underscores
    .trim();
  
  return `${name}${ext}`.toLowerCase();
}

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient();

  // Make sure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please log in.' };
  }

  const clientId = formData.get('clientId') as string;
  const filingId = formData.get('filingId') as string;
  const assessmentYear = formData.get('assessmentYear') as string;
  const documentType = formData.get('documentType') as string;
  const file = formData.get('file') as File;

  if (!clientId || !filingId || !assessmentYear || !documentType || !file) {
    return { error: 'Missing required parameters or file.' };
  }

  const allowedTypes = ['itr-v', 'intimation-order', 'form-16', 'computation', 'tax-report', 'acknowledgement', 'other'];
  if (!allowedTypes.includes(documentType)) {
    return { error: 'Invalid document type.' };
  }

  try {
    // 1. Programmatically verify / create the private bucket using Service Role client
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: buckets } = await adminSupabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'sdds-documents');
    if (!bucketExists) {
      const { error: createBucketError } = await adminSupabase.storage.createBucket('sdds-documents', {
        public: false
      });
      if (createBucketError) {
        console.error('Failed to create bucket programmatically:', createBucketError.message);
      }
    }

    // 2. Check for existing document in DB to avoid orphaned files in Storage
    const { data: existingDoc } = await supabase
      .from('filing_documents')
      .select('*')
      .eq('filing_id', filingId)
      .eq('document_type', documentType)
      .maybeSingle();

    if (existingDoc) {
      // Delete old file from storage first
      await supabase.storage.from(existingDoc.bucket_name).remove([existingDoc.storage_path]);
    }

    // 3. Build path and upload file
    const safeName = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const storagePath = `clients/${clientId}/${assessmentYear}/${documentType}/${timestamp}-${safeName}`;

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sdds-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      return { error: `Upload error: ${uploadError.message}` };
    }

    // 4. Upsert DB metadata
    const { error: dbError } = await supabase
      .from('filing_documents')
      .upsert({
        filing_id: filingId,
        client_id: clientId,
        assessment_year: assessmentYear,
        document_type: documentType,
        bucket_name: 'sdds-documents',
        storage_path: storagePath,
        original_file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id
      }, {
        onConflict: 'filing_id, document_type'
      });

    if (dbError) {
      console.error('Failed to insert metadata in DB:', dbError.message);
      // Clean up uploaded file
      await supabase.storage.from('sdds-documents').remove([storagePath]);
      return { error: `Database logging error: ${dbError.message}` };
    }

    // 5. Log activity
    await logActivity(
      clientId,
      'Document Uploaded',
      `Uploaded ${documentType} document: "${file.name}" to Supabase Storage.`,
      filingId
    );

    revalidatePath(`/clients/${clientId}`);
    return { success: true, message: `Successfully uploaded and registered ${documentType} document.` };

  } catch (err: any) {
    console.error('Upload document error:', err);
    return { error: `Upload process failed: ${err.message}` };
  }
}

export async function getSignedUrlAction(documentId: string) {
  const supabase = await createClient();

  // Make sure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized.' };
  }

  try {
    const { data: doc, error: dbError } = await supabase
      .from('filing_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (dbError || !doc) {
      return { error: 'Document not found.' };
    }

    // Generate short-lived signed URL (60 seconds)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(doc.bucket_name)
      .createSignedUrl(doc.storage_path, 60);

    if (urlError || !urlData) {
      return { error: `Failed to generate signed URL: ${urlError?.message}` };
    }

    return { success: true, signedUrl: urlData.signedUrl };
  } catch (err: any) {
    return { error: `Failed to generate signed URL: ${err.message}` };
  }
}

export async function deleteDocumentAction(documentId: string, clientId: string) {
  const supabase = await createClient();

  // Make sure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized.' };
  }

  try {
    const { data: doc, error: dbError } = await supabase
      .from('filing_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (dbError || !doc) {
      return { error: 'Document not found.' };
    }

    // 1. Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(doc.bucket_name)
      .remove([doc.storage_path]);

    if (storageError) {
      console.error('Warning: Failed to delete file from storage bucket:', storageError.message);
    }

    // 2. Delete database metadata record
    const { error: deleteError } = await supabase
      .from('filing_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      return { error: `Failed to delete document metadata: ${deleteError.message}` };
    }

    // 3. Log activity
    await logActivity(
      clientId,
      'Document Deleted',
      `Deleted ${doc.document_type} document: "${doc.original_file_name}" from storage.`,
      doc.filing_id
    );

    revalidatePath(`/clients/${clientId}`);
    return { success: true, message: 'Document successfully deleted.' };
  } catch (err: any) {
    return { error: `Delete process failed: ${err.message}` };
  }
}

function parseDateToISO(dateStr?: any): string | null {
  if (dateStr === null || dateStr === undefined) return null;
  const cleaned = String(dateStr).trim();
  if (!cleaned) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const dmyMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}

  return null;
}

async function generateUniqueTempPAN(supabase: any): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  while (true) {
    let temp = 'TEMP';
    for (let i = 0; i < 4; i++) {
      temp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    temp += chars.charAt(Math.floor(Math.random() * chars.length));
    temp += chars.charAt(Math.floor(Math.random() * chars.length));
    
    // Check if it already exists
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('pan', temp);
    if (count === 0) {
      return temp;
    }
  }
}

export async function importClientsCSVAction(rows: any[], assessmentYear: string) {
  const supabase = await createClient();

  // Make sure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!assessmentYear) {
    return { error: 'Assessment Year is required for import.' };
  }

  if (!rows || rows.length === 0) {
    return { error: 'No data rows found in the CSV.' };
  }

  const results = {
    successCount: 0,
    failCount: 0,
    errors: [] as string[]
  };

  const findValue = (row: any, keys: string[]): any => {
    for (const k of Object.keys(row)) {
      const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keys.some(key => key.toLowerCase().replace(/[^a-z0-9]/g, '') === normK)) {
        return row[k];
      }
    }
    return undefined;
  };

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const rowNum = idx + 2; // Row number in CSV (1-based, plus header)

    // Skip completely empty rows
    const hasAnyContent = Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== '');
    if (!hasAnyContent) {
      continue;
    }

    const nameRaw = findValue(row, ['name', 'clientname', 'client_name', 'client name']);
    const name = nameRaw ? String(nameRaw).trim() : 'Unnamed Client';
    
    const panRaw = findValue(row, ['pan']);
    let pan = panRaw ? String(panRaw).toUpperCase().trim() : '';
    
    // PAN validation (exactly 10 chars: 5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan || !panRegex.test(pan)) {
      pan = await generateUniqueTempPAN(supabase);
    }

    const mobileRaw = findValue(row, ['mobile', 'phone', 'mobilenumber', 'mobile_number', 'mobile number']);
    const mobile = mobileRaw ? String(mobileRaw).trim() : '';

    const dobRaw = findValue(row, ['dob', 'dateofbirth', 'date_of_birth', 'date of birth']);
    const dobStr = dobRaw ? String(dobRaw).trim() : '';
    let dobISO = '1900-01-01';
    
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    const dobRegexISO = /^\d{4}-\d{2}-\d{2}$/;
    if (dobStr) {
      if (dobRegex.test(dobStr)) {
        const [d, m, y] = dobStr.split('-');
        dobISO = `${y}-${m}-${d}`;
      } else if (dobRegexISO.test(dobStr)) {
        dobISO = dobStr;
      } else {
        const parsed = parseDateToISO(dobStr);
        if (parsed) {
          dobISO = parsed;
        }
      }
    }

    const aadhaarRaw = findValue(row, ['aadhaar', 'aadhaarcard', 'aadhaar_card', 'aadhaarnumber', 'aadhaar_number', 'aadhaar number']);
    const cleanAadhaar = aadhaarRaw ? String(aadhaarRaw).replace(/\s/g, '') : '';

    const passwordRaw = findValue(row, ['password', 'itrpassword', 'itr_password', 'itr password', 'portalpassword', 'portal_password', 'portal password']);
    const password = passwordRaw ? String(passwordRaw).trim() : generateDefaultPassword(pan);

    try {
      // 1. Find or create client
      let client = null;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('pan', pan)
        .maybeSingle();

      if (existingClient) {
        client = existingClient;
        // Update details if provided
        const updateData: any = {};
        const email = findValue(row, ['email', 'emailaddress', 'email_address', 'email address']);
        const address = findValue(row, ['address']);
        const family_group = findValue(row, ['familygroup', 'family_group', 'family group', 'group']);

        if (email) updateData.email = String(email).trim();
        if (cleanAadhaar) updateData.aadhaar = cleanAadhaar;
        if (address) updateData.address = String(address).trim();
        if (family_group) updateData.family_group = String(family_group).trim();
        if (mobile && mobile !== client.mobile) updateData.mobile = mobile;
        if (dobISO !== client.dob) updateData.dob = dobISO;

        if (Object.keys(updateData).length > 0) {
          await supabase.from('clients').update(updateData).eq('id', client.id);
        }

        // Update password if provided
        const encrypted = encrypt(password);
        await supabase.from('client_secrets').upsert({
          client_id: client.id,
          encrypted_password: encrypted
        });
      } else {
        const email = findValue(row, ['email', 'emailaddress', 'email_address', 'email address']);
        const address = findValue(row, ['address']);
        const family_group = findValue(row, ['familygroup', 'family_group', 'family group', 'group']);

        const { data: newClient, error: clientErr } = await supabase
          .from('clients')
          .insert({
            name,
            pan,
            mobile,
            dob: dobISO,
            email: email ? String(email).trim() : null,
            aadhaar: cleanAadhaar || null,
            address: address ? String(address).trim() : null,
            family_group: family_group ? String(family_group).trim() : null
          })
          .select()
          .single();

        if (clientErr || !newClient) {
          results.failCount++;
          results.errors.push(`Row ${rowNum} (${pan}): Client insertion failed - ${clientErr?.message}`);
          continue;
        }
        client = newClient;

        // Encrypt password
        const encrypted = encrypt(password);
        await supabase.from('client_secrets').insert({
          client_id: client.id,
          encrypted_password: encrypted
        });

        await logActivity(client.id, 'Client Added', `Client profile imported via CSV for PAN ${pan}.`);
      }

      // 2. Find or create Filing
      const itr_type = findValue(row, ['itrtype', 'itr_type', 'itr type', 'formtype', 'form_type', 'form type']) || 'ITR-1';
      const filing_status = findValue(row, ['filingstatus', 'filing_status', 'filing status', 'status']) || 'Yet To File';
      const filing_date = parseDateToISO(findValue(row, ['filingdate', 'filing_date', 'filing date']));
      const acknowledgement_number = findValue(row, ['acknowledgementnumber', 'acknowledgement_number', 'acknowledgement number', 'ackno', 'ack_no', 'ack no', 'acknumber', 'ack_number', 'ack number']);
      const refund_amount = Number(findValue(row, ['refundamount', 'refund_amount', 'refund amount', 'refund']) || 0);
      const refund_status = findValue(row, ['refundstatus', 'refund_status', 'refund status']) || 'Yet to receive';
      const intimation_status = findValue(row, ['intimationstatus', 'intimation_status', 'intimation status', 'intimation']) || 'Not Received';

      let filing = null;
      const { data: existingFiling } = await supabase
        .from('filings')
        .select('*')
        .eq('client_id', client.id)
        .eq('assessment_year', assessmentYear)
        .maybeSingle();

      if (existingFiling) {
        filing = existingFiling;
        await supabase
          .from('filings')
          .update({
            itr_type,
            filing_status,
            filing_date,
            acknowledgement_number: acknowledgement_number ? String(acknowledgement_number).trim() : null,
            refund_amount,
            refund_status,
            intimation_status,
            updated_at: new Date().toISOString()
          })
          .eq('id', filing.id);
      } else {
        const { data: newFiling, error: filingErr } = await supabase
          .from('filings')
          .insert({
            client_id: client.id,
            assessment_year: assessmentYear,
            itr_type,
            filing_status,
            filing_date,
            acknowledgement_number: acknowledgement_number ? String(acknowledgement_number).trim() : null,
            refund_amount,
            refund_status,
            intimation_status
          })
          .select()
          .single();

        if (filingErr || !newFiling) {
          results.failCount++;
          results.errors.push(`Row ${rowNum} (${pan}): Filing enrollment failed - ${filingErr?.message}`);
          continue;
        }
        filing = newFiling;
        await logActivity(client.id, 'Filing Enrolled', `Filing enrolled under AY ${assessmentYear} via CSV import.`, filing.id);
      }

      // 3. Find or create Invoice
      let invoice = null;
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('filing_id', filing.id)
        .maybeSingle();

      const filing_charge = Number(findValue(row, ['filingcharge', 'filing_charge', 'filing charge', 'charge', 'fee', 'filingfee', 'filing_fee', 'filing fee']) || 0);
      const refund_charge_pct = Number(findValue(row, ['refundchargepct', 'refund_charge_pct', 'refund charge pct', 'refundchargepercent', 'refund_charge_percent', 'refund charge percent', 'refundpct', 'refund_pct', 'refund pct']) || 0);
      const discount = Number(findValue(row, ['discount']) || 0);

      if (existingInvoice) {
        invoice = existingInvoice;
        await supabase
          .from('invoices')
          .update({
            filing_charge,
            refund_charge_pct,
            discount,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
      } else {
        const { data: lastInvoice } = await supabase
          .from('invoices')
          .select('serial_number')
          .eq('assessment_year', assessmentYear)
          .order('serial_number', { ascending: false })
          .limit(1);

        const nextSerial = (lastInvoice?.[0]?.serial_number || 0) + 1;
        const serialStr = String(nextSerial).padStart(3, '0');
        const invoiceNumber = `SDDS/ITR/${assessmentYear}/${serialStr}`;

        const { data: newInvoice, error: invErr } = await supabase
          .from('invoices')
          .insert({
            filing_id: filing.id,
            invoice_number: invoiceNumber,
            serial_number: nextSerial,
            assessment_year: assessmentYear,
            filing_charge,
            refund_charge_pct,
            discount,
            settlement_amount: 0,
            outstanding_amount: 0,
            payment_status: 'Unpaid'
          })
          .select()
          .single();

        if (invErr || !newInvoice) {
          results.failCount++;
          results.errors.push(`Row ${rowNum} (${pan}): Invoice creation failed - ${invErr?.message}`);
          continue;
        }
        invoice = newInvoice;
      }

      // Recalculate invoice billing math
      await recalculateInvoice(invoice.id);

      // 4. Handle Payment recording if provided
      const amount_received = Number(findValue(row, ['amountreceived', 'amount_received', 'amount received', 'receivedamount', 'received_amount', 'received amount', 'paidamount', 'paid_amount', 'paid amount']) || 0);
      if (amount_received > 0) {
        // Only record if payments don't exist yet for this invoice (avoid duplicate imports)
        const { data: existingPayments } = await supabase
          .from('payments')
          .select('id')
          .eq('invoice_id', invoice.id);

        if (!existingPayments || existingPayments.length === 0) {
          const payment_mode = findValue(row, ['paymentmode', 'payment_mode', 'payment mode', 'mode']) || 'UPI';
          const payment_date = parseDateToISO(findValue(row, ['paymentdate', 'payment_date', 'payment date'])) || new Date().toISOString().split('T')[0];
          const notes = findValue(row, ['notes', 'note']) || 'CSV Import';

          await supabase
            .from('payments')
            .insert({
              invoice_id: invoice.id,
              amount: amount_received,
              payment_mode,
              payment_date,
              notes
            });

          // Recalculate invoice after payment
          await recalculateInvoice(invoice.id);

          await logActivity(
            client.id,
            'Payment Received',
            `Received payment of ₹${amount_received} via ${payment_mode} recorded during import.`
          );
        }
      }

      results.successCount++;
    } catch (err: any) {
      results.failCount++;
      results.errors.push(`Row ${rowNum} (${pan}): Unexpected error - ${err.message}`);
    }
  }

  revalidatePath('/clients');
  revalidatePath('/queue');
  revalidatePath('/invoices');
  revalidatePath('/');
  return results;
}

export async function logWhatsAppActivityAction(clientId: string, filingId: string, assessmentYear: string) {
  await logActivity(
    clientId,
    'WhatsApp Sent',
    `Sent WhatsApp follow-up filing reminder for Assessment Year ${assessmentYear}.`,
    filingId
  );
  return { success: true };
}

export async function logWhatsAppPaymentActivityAction(clientId: string, invoiceNumber: string, amount: number) {
  await logActivity(
    clientId,
    'WhatsApp Sent',
    `Sent WhatsApp outstanding payment reminder for Invoice ${invoiceNumber} of amount ₹${amount}.`
  );
  return { success: true };
}


export async function createRevisedFilingAction(clientId: string, assessmentYear: string) {
  const supabase = await createClient();

  // 1. Get the latest revision number for this AY
  const { data: filings } = await supabase
    .from('filings')
    .select('revision_number')
    .eq('client_id', clientId)
    .eq('assessment_year', assessmentYear)
    .order('revision_number', { ascending: false });

  const nextRevision = (filings?.[0]?.revision_number || 0) + 1;

  // 2. Create the revised filing
  const { data: newFiling, error: filingError } = await supabase
    .from('filings')
    .insert({
      client_id: clientId,
      assessment_year: assessmentYear,
      return_type: 'Revised',
      revision_number: nextRevision,
      filing_status: 'Yet To File',
      intimation_status: 'Not Received'
    })
    .select()
    .single();

  if (filingError) {
    return { error: `Failed to create revised return: ${filingError.message}` };
  }

  // 3. Create empty invoice
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('serial_number')
    .eq('assessment_year', assessmentYear)
    .order('serial_number', { ascending: false })
    .limit(1);

  const nextSerial = (lastInvoice?.[0]?.serial_number || 0) + 1;
  const serialStr = String(nextSerial).padStart(3, '0');
  const invoiceNumber = `SDDS/ITR/${assessmentYear}/${serialStr}`;

  await supabase.from('invoices').insert({
    filing_id: newFiling.id,
    invoice_number: invoiceNumber,
    serial_number: nextSerial,
    assessment_year: assessmentYear,
    filing_charge: 0,
    settlement_amount: 0,
    outstanding_amount: 0,
    payment_status: 'Unpaid'
  });

  await logActivity(clientId, 'Filing Enrolled', `Started Revised ITR Return filing (Rev ${nextRevision}) for Assessment Year ${assessmentYear}.`, newFiling.id);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/queue');
  revalidatePath('/invoices');
  revalidatePath('/');
  return { success: true };
}

export async function backfillDefaultPasswordsAction() {
  const supabase = await createClient();

  // Make sure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized.' };
  }

  try {
    // 1. Fetch all clients
    const { data: clients, error: clientsErr } = await supabase
      .from('clients')
      .select('id, pan');

    if (clientsErr || !clients) {
      return { error: `Failed to fetch clients: ${clientsErr?.message}` };
    }

    // 2. Fetch all existing secrets
    const { data: secrets, error: secretsErr } = await supabase
      .from('client_secrets')
      .select('client_id');

    if (secretsErr) {
      return { error: `Failed to fetch client secrets: ${secretsErr.message}` };
    }

    const clientsWithSecret = new Set(secrets?.map(s => s.client_id));
    let backfilledCount = 0;

    for (const client of clients) {
      if (!clientsWithSecret.has(client.id)) {
        // Generate default password
        const defaultPassword = generateDefaultPassword(client.pan);
        const encrypted = encrypt(defaultPassword);

        const { error: insertErr } = await supabase
          .from('client_secrets')
          .insert({
            client_id: client.id,
            encrypted_password: encrypted
          });

        if (insertErr) {
          console.error(`Failed to backfill password for client ${client.id}:`, insertErr.message);
        } else {
          backfilledCount++;
          // Log activity
          await logActivity(client.id, 'Password Generated', 'Auto-generated and encrypted default ITR Portal Password from PAN.');
        }
      }
    }

    return { success: true, count: backfilledCount, message: `Successfully generated default passwords for ${backfilledCount} clients.` };
  } catch (err: any) {
    return { error: `Backfill process failed: ${err.message}` };
  }
}

export async function saveSystemSettingsAction(key: string, value: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized.' };
  }

  const { error } = await supabase
    .from('system_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return { error: `Failed to save settings: ${error.message}` };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function getSystemSettingsAction(key: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized.' };
  }

  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    return { error: `Failed to fetch settings: ${error.message}` };
  }

  return { success: true, value: data ? data.value : null };
}



