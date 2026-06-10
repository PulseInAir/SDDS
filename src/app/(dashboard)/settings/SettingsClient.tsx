'use client';

import { useState, useTransition } from 'react';
import { backfillDefaultPasswordsAction, saveSystemSettingsAction } from '../clients/actions';
import {
  CheckCircle, AlertTriangle, ShieldAlert,
  Loader2, RefreshCw, Save, Info, Briefcase, DollarSign, MessageSquare
} from 'lucide-react';

interface SettingsClientProps {
  ayList: string[];
  currentAY: string;
  configStatus: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    encryptionKey: boolean;
  };
  initialFirmProfile: {
    firmName: string;
    taxProName: string;
    gstin: string;
    email: string;
    mobile: string;
  };
  initialFeePresets: {
    'ITR-1': number;
    'ITR-2': number;
    'ITR-3': number;
    'ITR-4': number;
    'Other': number;
  };
  initialWhatsappTemplates: {
    filing_reminder: string;
    payment_reminder: string;
  };
  initialThemePreference: string;
}

export default function SettingsClient({
  ayList,
  currentAY,
  configStatus,
  initialFirmProfile,
  initialFeePresets,
  initialWhatsappTemplates,
  initialThemePreference
}: SettingsClientProps) {
  // State for forms
  const [firmProfile, setFirmProfile] = useState(initialFirmProfile);
  const [feePresets, setFeePresets] = useState(initialFeePresets);
  const [whatsappTemplates, setWhatsappTemplates] = useState(initialWhatsappTemplates);
  const [themePreference, setThemePreference] = useState(initialThemePreference);
  const [savingTheme, setSavingTheme] = useState<string | null>(null);

  // Transitions for savings
  const [isFirmPending, startFirmTransition] = useTransition();
  const [isFeePending, startFeeTransition] = useTransition();
  const [isWaPending, startWaTransition] = useTransition();
  const [isThemePending, startThemeTransition] = useTransition();
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Status feedback messages
  const [firmStatus, setFirmStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [feeStatus, setFeeStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [waStatus, setWaStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [themeStatus, setThemeStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [backfillResult, setBackfillResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Handlers for saves
  const handleSaveFirmProfile = () => {
    setFirmStatus(null);
    startFirmTransition(async () => {
      try {
        const res = await saveSystemSettingsAction('firm_profile', firmProfile);
        if (res.error) {
          setFirmStatus({ type: 'error', text: res.error });
        } else {
          setFirmStatus({ type: 'success', text: 'Firm Profile saved successfully!' });
          setTimeout(() => setFirmStatus(null), 3000);
        }
      } catch (err: any) {
        setFirmStatus({ type: 'error', text: err.message || 'An unexpected error occurred.' });
      }
    });
  };

  const handleSaveFeePresets = () => {
    setFeeStatus(null);
    startFeeTransition(async () => {
      try {
        // Parse values to numbers
        const sanitizedPresets = {
          'ITR-1': Number(feePresets['ITR-1']) || 0,
          'ITR-2': Number(feePresets['ITR-2']) || 0,
          'ITR-3': Number(feePresets['ITR-3']) || 0,
          'ITR-4': Number(feePresets['ITR-4']) || 0,
          'Other': Number(feePresets['Other']) || 0,
        };
        const res = await saveSystemSettingsAction('fee_presets', sanitizedPresets);
        if (res.error) {
          setFeeStatus({ type: 'error', text: res.error });
        } else {
          setFeeStatus({ type: 'success', text: 'Filing Fee Presets saved successfully!' });
          setTimeout(() => setFeeStatus(null), 3000);
        }
      } catch (err: any) {
        setFeeStatus({ type: 'error', text: err.message || 'An unexpected error occurred.' });
      }
    });
  };

  const handleSaveTemplates = () => {
    setWaStatus(null);
    startWaTransition(async () => {
      try {
        const res = await saveSystemSettingsAction('whatsapp_templates', whatsappTemplates);
        if (res.error) {
          setWaStatus({ type: 'error', text: res.error });
        } else {
          setWaStatus({ type: 'success', text: 'WhatsApp templates saved successfully!' });
          setTimeout(() => setWaStatus(null), 3000);
        }
      } catch (err: any) {
        setWaStatus({ type: 'error', text: err.message || 'An unexpected error occurred.' });
      }
    });
  };

  const handleSaveTheme = (newTheme: string) => {
    setSavingTheme(newTheme);
    setThemePreference(newTheme);
    setThemeStatus(null);
    startThemeTransition(async () => {
      try {
        const res = await saveSystemSettingsAction('theme_preference', newTheme);
        if (res.error) {
          setThemeStatus({ type: 'error', text: res.error });
          setSavingTheme(null);
        } else {
          setThemeStatus({ type: 'success', text: 'Theme preference saved!' });
          setTimeout(() => {
            setThemeStatus(null);
            window.location.reload(); // Reload immediately to apply theme
          }, 500);
        }
      } catch (err: any) {
        setThemeStatus({ type: 'error', text: err.message || 'An unexpected error occurred.' });
        setSavingTheme(null);
      }
    });
  };

  const handleBackfillPasswords = async () => {
    if (!confirm('Are you sure you want to backfill missing passwords for all clients using their PAN details?')) return;
    setIsBackfilling(true);
    setBackfillResult(null);
    try {
      const res = await backfillDefaultPasswordsAction();
      if (res.error) {
        setBackfillResult({ type: 'error', text: res.error });
      } else {
        setBackfillResult({ type: 'success', text: res.message || 'Backfill complete!' });
      }
    } catch (err: any) {
      setBackfillResult({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Configurable settings (Firm, Fees, Templates) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Firm Profile Settings Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                <span>Firm Profile & Branding</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Configure company metadata used for invoices and reminder templates.</p>
            </div>
            
            <button
              onClick={handleSaveFirmProfile}
              disabled={isFirmPending}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
            >
              {isFirmPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isFirmPending ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          {firmStatus && (
            <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold ${
              firmStatus.type === 'success' 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : 'bg-red-950/20 border-red-900/30 text-red-400'
            }`}>
              {firmStatus.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Firm Name</label>
              <input
                type="text"
                value={firmProfile.firmName}
                onChange={(e) => setFirmProfile({ ...firmProfile, firmName: e.target.value })}
                placeholder="e.g. SDDS Partners"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax Professional Name</label>
              <input
                type="text"
                value={firmProfile.taxProName}
                onChange={(e) => setFirmProfile({ ...firmProfile, taxProName: e.target.value })}
                placeholder="e.g. CA Pulak Dehingia"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Firm GSTIN</label>
              <input
                type="text"
                value={firmProfile.gstin}
                onChange={(e) => setFirmProfile({ ...firmProfile, gstin: e.target.value })}
                placeholder="15-digit GSTIN (optional)"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
              <input
                type="email"
                value={firmProfile.email}
                onChange={(e) => setFirmProfile({ ...firmProfile, email: e.target.value })}
                placeholder="firm@example.com"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Mobile (WhatsApp Support)</label>
              <input
                type="text"
                value={firmProfile.mobile}
                onChange={(e) => setFirmProfile({ ...firmProfile, mobile: e.target.value })}
                placeholder="9876543210 (without country code)"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Reminder Templates Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <span>WhatsApp Notification Templates</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Customize the copy sent out to clients during reminders. Click variables below to insert them.</p>
            </div>
            
            <button
              onClick={handleSaveTemplates}
              disabled={isWaPending}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
            >
              {isWaPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isWaPending ? 'Saving...' : 'Save Templates'}</span>
            </button>
          </div>

          {waStatus && (
            <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold ${
              waStatus.type === 'success' 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : 'bg-red-950/20 border-red-900/30 text-red-400'
            }`}>
              {waStatus.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Filing Reminder template */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filing Doc Request Template</label>
                <div className="flex gap-1">
                  {['{client_name}', '{assessment_year}', '{firm_name}'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setWhatsappTemplates({
                        ...whatsappTemplates,
                        filing_reminder: whatsappTemplates.filing_reminder + ' ' + tag
                      })}
                      className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[9px] font-mono text-slate-400 hover:text-white cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={3}
                value={whatsappTemplates.filing_reminder}
                onChange={(e) => setWhatsappTemplates({ ...whatsappTemplates, filing_reminder: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* Payment Reminder template */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Payment Reminder Template</label>
                <div className="flex gap-1">
                  {['{client_name}', '{invoice_number}', '{amount}', '{firm_name}'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setWhatsappTemplates({
                        ...whatsappTemplates,
                        payment_reminder: whatsappTemplates.payment_reminder + ' ' + tag
                      })}
                      className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[9px] font-mono text-slate-400 hover:text-white cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={3}
                value={whatsappTemplates.payment_reminder}
                onChange={(e) => setWhatsappTemplates({ ...whatsappTemplates, payment_reminder: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex items-start space-x-3 text-[11px] text-slate-400 font-medium">
              <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">Template Engine Information:</span>
                <p>These messages are rendered on-the-fly and parsed into raw text during actions like the WhatsApp Reminder API launcher. Ensure syntax variables remain clean.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filing Fee Presets Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <span>ITR Filing Fee Presets</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Default flat invoice fees automatically selected when creating filings for new clients.</p>
            </div>
            
            <button
              onClick={handleSaveFeePresets}
              disabled={isFeePending}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
            >
              {isFeePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isFeePending ? 'Saving...' : 'Save Presets'}</span>
            </button>
          </div>

          {feeStatus && (
            <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold ${
              feeStatus.type === 'success' 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : 'bg-red-950/20 border-red-900/30 text-red-400'
            }`}>
              {feeStatus.text}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {(['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'Other'] as const).map(itrType => (
              <div key={itrType} className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{itrType} Fee</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[10px] font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    value={feePresets[itrType]}
                    onChange={(e) => setFeePresets({ ...feePresets, [itrType]: Number(e.target.value) || 0 })}
                    placeholder="1000"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Health Status & Utilities (Password Backfill) */}
      <div className="space-y-6 select-none">
        
        {/* App Theme Selection Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>App Visual Theme</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Select your preferred user interface design preference.</p>
          </div>

          {themeStatus && (
            <div className={`p-3 rounded-xl border text-xs font-semibold ${
              themeStatus.type === 'success' 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : 'bg-red-950/20 border-red-900/30 text-red-400'
            }`}>
              {themeStatus.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSaveTheme('light')}
              disabled={isThemePending}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                themePreference === 'light'
                  ? 'bg-slate-800 border-slate-700 text-slate-200 shadow-md'
                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
              }`}
            >
              {isThemePending && savingTheme === 'light' ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1 text-blue-400" />
              ) : (
                <span className="text-xl mb-1">☀️</span>
              )}
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => handleSaveTheme('dark')}
              disabled={isThemePending}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                themePreference === 'dark'
                  ? 'bg-slate-900 border-slate-750 text-white shadow-md'
                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
              }`}
            >
              {isThemePending && savingTheme === 'dark' ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1 text-blue-400" />
              ) : (
                <span className="text-xl mb-1">🌙</span>
              )}
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
        
        {/* Credentials/Drive health check card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-4.5 w-4.5 text-emerald-400" />
              <span>Connection Health</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Live status of backend secrets configurations.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-850">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Supabase Client</span>
                <span className="text-xs text-white font-semibold mt-0.5 block">Database Connection</span>
              </div>
              {configStatus.supabaseUrl && configStatus.supabaseAnonKey ? (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">Connected</span>
              ) : (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">Missing Config</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-850">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Reversible Cryptography</span>
                <span className="text-xs text-white font-semibold mt-0.5 block">Portal Password Decryption</span>
              </div>
              {configStatus.encryptionKey ? (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">Enabled</span>
              ) : (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">Missing Key</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-850">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Supabase Storage</span>
                <span className="text-xs text-white font-semibold mt-0.5 block">sdds-documents Private Bucket</span>
              </div>
              {configStatus.supabaseUrl ? (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">Ready</span>
              ) : (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">Unconfigured</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 font-medium leading-relaxed">
            <span className="font-bold text-white block mb-1">Storage Configuration Instruction:</span>
            <p>Document storage has migrated from Google Drive to Supabase Storage. The private bucket <code>sdds-documents</code> handles PDF & tax files securely via short-lived signed URLs.</p>
          </div>
        </div>

        {/* Default Password Backfill Utility */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-3">
          <span className="font-bold text-white text-xs block">Default Password Backfill</span>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            Generate and encrypt default ITR Portal Passwords (e.g. <code>abcde*1234F</code>) for any existing clients who do not have a password set.
          </p>
          <button
            type="button"
            onClick={handleBackfillPasswords}
            disabled={isBackfilling}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white rounded-xl cursor-pointer transition-colors"
          >
            {isBackfilling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>{isBackfilling ? 'Backfilling...' : 'Backfill Default Passwords'}</span>
          </button>
          {backfillResult && (
            <span className={`text-[10px] font-bold block mt-1.5 ${
              backfillResult.type === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {backfillResult.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
