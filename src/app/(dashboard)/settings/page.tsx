import { getAssessmentYears, getCurrentAssessmentYear } from '@/utils/ay';
import { createClient } from '@/utils/supabase/server';
import SettingsClient from './SettingsClient';

export const revalidate = 0; // Dynamic rendering

export default async function SettingsPage() {
  const ayList = getAssessmentYears();
  const currentAY = getCurrentAssessmentYear();
  const supabase = await createClient();

  // Check server environment variables configuration status
  const configStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    encryptionKey: !!process.env.ENCRYPTION_KEY,
  };

  // Fetch settings from the system_settings table
  let dbSettings: any[] = [];
  try {
    const { data } = await supabase.from('system_settings').select('*');
    dbSettings = data || [];
  } catch (err) {
    console.error('Failed to load system settings from Supabase:', err);
  }

  const settingsMap = dbSettings.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, any>);

  // Default Fallbacks
  const firmProfile = settingsMap['firm_profile'] || {
    firmName: '',
    taxProName: '',
    gstin: '',
    email: '',
    mobile: ''
  };

  const feePresets = settingsMap['fee_presets'] || {
    'ITR-1': 1000,
    'ITR-2': 2000,
    'ITR-3': 3000,
    'ITR-4': 2000,
    'Other': 1500
  };

  const whatsappTemplates = settingsMap['whatsapp_templates'] || {
    filing_reminder: 'Hello {client_name}, your ITR filing for AY {assessment_year} is pending. Please send us your Form 16, bank statements, and other documents at your earliest convenience to avoid last-minute rush. - {firm_name}',
    payment_reminder: 'Hello {client_name}, this is a gentle reminder that invoice {invoice_number} of amount ₹{amount} for your ITR filing is outstanding. Kindly clear the dues as soon as possible. - {firm_name}'
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-400 mt-2">
          Manage firm branding profiles, ITR filing fee presets, WhatsApp messaging templates, and check database secrets.
        </p>
      </div>

      <SettingsClient
        ayList={ayList}
        currentAY={currentAY}
        configStatus={configStatus}
        initialFirmProfile={firmProfile}
        initialFeePresets={feePresets}
        initialWhatsappTemplates={whatsappTemplates}
      />
    </div>
  );
}
