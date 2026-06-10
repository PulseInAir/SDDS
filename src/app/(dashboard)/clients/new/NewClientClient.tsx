'use client';

import { useState, useTransition } from 'react';
import { createClientAction, checkDuplicateAction } from '../actions';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, X, Loader2, ArrowLeft, ShieldAlert, CheckCircle, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

interface DuplicateInfo {
  id: string;
  name: string;
  pan: string;
  mobile: string;
  matchType: 'PAN' | 'Mobile' | 'Both';
}

export default function NewClientClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [panInput, setPanInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordManual, setIsPasswordManual] = useState(false);
  const [mobileInput, setMobileInput] = useState('');

  // Duplicate detection
  const [panDuplicates, setPanDuplicates] = useState<DuplicateInfo[]>([]);
  const [mobileDuplicates, setMobileDuplicates] = useState<DuplicateInfo[]>([]);
  const [checkingPan, setCheckingPan] = useState(false);
  const [checkingMobile, setCheckingMobile] = useState(false);

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim();
    setPanInput(val);
    
    if (!isPasswordManual) {
      if (val.length === 10) {
        const firstFive = val.substring(0, 5).toLowerCase();
        const numbers = val.substring(5, 9);
        const lastOne = val.substring(9, 10).toUpperCase();
        setPasswordInput(`${firstFive}*${numbers}${lastOne}`);
      } else {
        setPasswordInput('');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
    setIsPasswordManual(true);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileInput(e.target.value);
  };

  // Check PAN duplicates on blur
  const handlePanBlur = async () => {
    const pan = panInput.toUpperCase().trim();
    if (pan.length !== 10) {
      setPanDuplicates([]);
      return;
    }
    setCheckingPan(true);
    try {
      const { duplicates } = await checkDuplicateAction(pan, '');
      setPanDuplicates(duplicates.filter(d => d.matchType === 'PAN' || d.matchType === 'Both'));
    } catch {
      setPanDuplicates([]);
    } finally {
      setCheckingPan(false);
    }
  };

  // Check Mobile duplicates on blur
  const handleMobileBlur = async () => {
    const mobile = mobileInput.trim();
    if (mobile.length !== 10) {
      setMobileDuplicates([]);
      return;
    }
    setCheckingMobile(true);
    try {
      const { duplicates } = await checkDuplicateAction('', mobile);
      setMobileDuplicates(duplicates.filter(d => d.matchType === 'Mobile'));
    } catch {
      setMobileDuplicates([]);
    } finally {
      setCheckingMobile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    
    // Client-side validations
    const name = (formData.get('name') as string).trim();
    const pan = (formData.get('pan') as string).toUpperCase().trim();
    const dobRaw = (formData.get('dob') as string).trim(); // Expected DD-MM-YYYY
    const mobile = (formData.get('mobile') as string).trim();
    const email = (formData.get('email') as string).trim();
    const aadhaarRaw = (formData.get('aadhaar') as string).replace(/\s/g, ''); // strip spaces
    const password = (formData.get('password') as string).trim();

    if (!name || !pan || !dobRaw || !mobile || !password) {
      setError('Full Name, PAN, DOB, Mobile, and ITR Portal Password are required.');
      return;
    }

    // 1. PAN validation (exactly 10 chars: 5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      setError('Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F: 5 letters, 4 numbers, 1 letter).');
      return;
    }

    // 2. Mobile validation (exactly 10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Invalid Mobile number. Must be exactly 10 digits (e.g., 9876543210). No country codes.');
      return;
    }

    // 3. DOB validation (DD-MM-YYYY)
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!dobRegex.test(dobRaw)) {
      setError('Invalid Date of Birth format. Must be in DD-MM-YYYY format (e.g., 31-01-1990).');
      return;
    }

    // 4. Aadhaar validation (if entered, must be exactly 12 digits)
    if (aadhaarRaw) {
      const aadhaarRegex = /^[0-9]{12}$/;
      if (!aadhaarRegex.test(aadhaarRaw)) {
        setError('Invalid Aadhaar number. Must be exactly 12 digits if provided.');
        return;
      }
    }

    // Format DOB to YYYY-MM-DD for PostgreSQL DATE type
    const [d, m, y] = dobRaw.split('-');
    const formattedDob = `${y}-${m}-${d}`;

    // Update FormData values
    formData.set('pan', pan);
    formData.set('dob', formattedDob);
    if (aadhaarRaw) {
      formData.set('aadhaar', aadhaarRaw);
    }

    startTransition(async () => {
      try {
        const res = await createClientAction(formData);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess('Client profile created successfully and enrolled in active filing queue!');
          setTimeout(() => {
            router.push('/clients');
          }, 1500);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 relative overflow-hidden select-none">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
        <Link
          href="/clients"
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-semibold text-slate-300 rounded-xl transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Clients</span>
        </Link>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">New Client Form</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Client Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. CA Pulak Dehingia"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              PAN Number (10 characters) *
            </label>
            <input
              type="text"
              name="pan"
              required
              maxLength={10}
              value={panInput}
              onChange={handlePanChange}
              onBlur={handlePanBlur}
              placeholder="e.g. ABCDE1234F"
              className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-white font-mono uppercase tracking-wide text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                panDuplicates.length > 0 ? 'border-red-500/60' : 'border-slate-850'
              }`}
            />
            {checkingPan && (
              <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking for duplicates...</span>
              </div>
            )}
            {panDuplicates.map(dup => (
              <div key={dup.id} className="flex items-center space-x-2 mt-1.5 p-2 bg-red-950/30 border border-red-900/40 rounded-lg text-[11px] text-red-400">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Duplicate PAN: Client <strong>&quot;{dup.name}&quot;</strong> already exists with this PAN.</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Date of Birth (DOB) *
            </label>
            <input
              type="text"
              name="dob"
              required
              placeholder="DD-MM-YYYY"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Mobile Number (10 digits) *
            </label>
            <input
              type="tel"
              name="mobile"
              required
              maxLength={10}
              value={mobileInput}
              onChange={handleMobileChange}
              onBlur={handleMobileBlur}
              placeholder="e.g. 9876543210"
              className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                mobileDuplicates.length > 0 ? 'border-amber-500/60' : 'border-slate-850'
              }`}
            />
            {checkingMobile && (
              <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking for duplicates...</span>
              </div>
            )}
            {mobileDuplicates.map(dup => (
              <div key={dup.id} className="flex items-center space-x-2 mt-1.5 p-2 bg-amber-950/30 border border-amber-900/40 rounded-lg text-[11px] text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Same mobile: Client <strong>&quot;{dup.name}&quot;</strong> ({dup.pan}) shares this number.</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. client@email.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Aadhaar Number (12 digits)
            </label>
            <input
              type="text"
              name="aadhaar"
              maxLength={14}
              placeholder="e.g. 1234 5678 9012"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Family Group Name
            </label>
            <input
              type="text"
              name="family_group"
              placeholder="e.g. Dehingia Group"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              ITR Portal Password *
            </label>
            <input
              type="text"
              name="password"
              required
              value={passwordInput}
              onChange={handlePasswordChange}
              placeholder="Portal password (automatically generated from PAN, edit if needed)"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Residential Address
            </label>
            <textarea
              name="address"
              rows={4}
              placeholder="Full mailing address..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-850 flex items-center justify-end space-x-3">
          <Link
            href="/clients"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-blue-500/10"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering Client...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Client Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
