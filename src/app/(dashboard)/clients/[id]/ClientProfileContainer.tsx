'use client';

import { useState, useTransition } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { getCurrentAssessmentYear } from '@/utils/ay';
import { 
  updateClientAction, 
  decryptPasswordAction, 
  recordPaymentAction, 
  addNoteAction, 
  updateFilingStatusAction,
  createFilingForAYAction,
  uploadDocumentAction,
  getSignedUrlAction,
  deleteDocumentAction,
  createRevisedFilingAction,
  deleteClientsAction
} from '../actions';
import { 
  Eye, EyeOff, Copy, Phone, Mail, MapPin, Calendar, Users, 
  CheckCircle2, AlertCircle, IndianRupee, Clock, Send, Lock, 
  FileText, Edit2, ClipboardCheck, MessageSquare, Plus, Loader2, ArrowUpRight, X, Trash2, Download
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClientProfileContainerProps {
  client: any;
  filings: any[];
  invoices: any[];
  payments: any[];
  activityLogs: any[];
  selectedAY: string;
  ayList: string[];
}

export default function ClientProfileContainer({
  client,
  filings,
  invoices,
  payments,
  activityLogs,
  selectedAY,
  ayList
}: ClientProfileContainerProps) {
  const { isPrivacyMode } = usePrivacy();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteClient = async () => {
    if (!confirm(`Are you sure you want to permanently delete this client profile? This will delete all filings, invoices, and credentials associated with ${client.name}. This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await deleteClientsAction([client.id]);
      if (res.error) {
        alert(res.error);
      } else {
        router.push('/clients');
      }
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred.');
    }
  };

  // Selected AY specific records
  const ayFilings = filings.filter(f => f.assessment_year === selectedAY)
    .sort((a, b) => a.revision_number - b.revision_number); // Original first, then Rev 1, Rev 2...

  const [selectedFilingId, setSelectedFilingId] = useState<string | null>(null);
  const [prevAY, setPrevAY] = useState(selectedAY);
  if (selectedAY !== prevAY) {
    setPrevAY(selectedAY);
    setSelectedFilingId(null);
  }

  const currentFiling = ayFilings.find(f => f.id === selectedFilingId) || ayFilings[ayFilings.length - 1];
  const currentInvoice = invoices.find(inv => inv.filing_id === currentFiling?.id);
  const currentPayments = payments.filter(p => p.invoice_id === currentInvoice?.id);
  const intimationDoc = currentFiling?.filing_documents?.find((d: any) => d.document_type === 'intimation-order');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpdateFilingOpen, setIsUpdateFilingOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Individual eye-reveals
  const [revealPan, setRevealPan] = useState(false);
  const [revealMobile, setRevealMobile] = useState(false);
  const [revealEmail, setRevealEmail] = useState(false);
  const [revealAddress, setRevealAddress] = useState(false);
  const [revealIntimationPassword, setRevealIntimationPassword] = useState(false);
  const [revealRefund, setRevealRefund] = useState(false);
  const [revealBilling, setRevealBilling] = useState(false);
  const [revealPayment, setRevealPayment] = useState(false);

  // Form notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy buttons states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [docMessage, setDocMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploadDocType, setUploadDocType] = useState('itr-v');

  // Generate Intimation password: PAN (lowercase) + DOB (DDMMYYYY)
  const formatDOBForPassword = (dobString: string) => {
    if (!dobString) return '';
    const date = new Date(dobString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const formatDOBToDDMMYYYY = (dobString: string) => {
    if (!dobString) return '';
    const parts = dobString.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    }
    const date = new Date(dobString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const intimationPassword = (client.pan.toLowerCase() + formatDOBForPassword(client.dob)).trim();

  // Helper to copy text to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Fetch decrypted password on demand
  const handleRevealPassword = async () => {
    if (decryptedPassword) {
      setShowPassword(!showPassword);
      return;
    }

    setDecrypting(true);
    try {
      const res = await decryptPasswordAction(client.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setDecryptedPassword(res.password || '');
      setShowPassword(true);
    } catch (err) {
      console.error('Password retrieval failed:', err);
    } finally {
      setDecrypting(false);
    }
  };

  // Handle Edit Profile Submission
  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    
    // Client-side validations
    const name = (formData.get('name') as string).trim();
    const dobRaw = (formData.get('dob') as string).trim(); // Expected DD-MM-YYYY
    const mobile = (formData.get('mobile') as string).trim();
    const aadhaarRaw = (formData.get('aadhaar') as string).replace(/\s/g, ''); // strip spaces

    if (!name || !dobRaw || !mobile) {
      setErrorMsg('Full Name, Mobile, and Date of Birth are required.');
      return;
    }

    // 1. Mobile validation (exactly 10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      setErrorMsg('Invalid Mobile number. Must be exactly 10 digits (no country code).');
      return;
    }

    // 2. DOB validation (DD-MM-YYYY)
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!dobRegex.test(dobRaw)) {
      setErrorMsg('Invalid Date of Birth format. Must be in DD-MM-YYYY format (e.g., 31-01-1990).');
      return;
    }

    // 3. Aadhaar validation (if entered, must be exactly 12 digits)
    if (aadhaarRaw) {
      const aadhaarRegex = /^[0-9]{12}$/;
      if (!aadhaarRegex.test(aadhaarRaw)) {
        setErrorMsg('Invalid Aadhaar number. Must be exactly 12 digits if provided.');
        return;
      }
    }

    // Format DOB to YYYY-MM-DD for PostgreSQL DATE type
    const [d, m, y] = dobRaw.split('-');
    const formattedDob = `${y}-${m}-${d}`;

    // Update FormData values
    formData.set('dob', formattedDob);
    if (aadhaarRaw) {
      formData.set('aadhaar', aadhaarRaw);
    }

    startTransition(async () => {
      const res = await updateClientAction(client.id, formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setSuccessMsg(null);
        }, 1500);
      }
    });
  };

  // Handle Update Filing details Submission
  const handleUpdateFiling = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const statusDetails = {
      filing_status: formData.get('filing_status') as string,
      itr_type: formData.get('itr_type') as string,
      filing_date: (formData.get('filing_date') as string) || undefined,
      acknowledgement_number: formData.get('acknowledgement_number') as string,
      refund_amount: Number(formData.get('refund_amount') || 0),
      refund_status: formData.get('refund_status') as string,
      refund_received_date: (formData.get('refund_received_date') as string) || undefined,
      intimation_status: formData.get('intimation_status') as string,
      // billing details
      filing_charge: Number(formData.get('filing_charge') || 0),
      refund_charge_pct: Number(formData.get('refund_charge_pct') || 0),
      discount: Number(formData.get('discount') || 0)
    };

    startTransition(async () => {
      const res = await updateFilingStatusAction(client.id, currentFiling.id, statusDetails);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Filing and billing records updated successfully!');
        setTimeout(() => {
          setIsUpdateFilingOpen(false);
          setSuccessMsg(null);
        }, 1500);
      }
    });
  };

  // Handle Record Payment Submission
  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount') || 0);
    const mode = formData.get('payment_mode') as string;
    const date = formData.get('payment_date') as string;
    const notes = formData.get('notes') as string;

    startTransition(async () => {
      const res = await recordPaymentAction(currentInvoice.id, amount, mode, date, notes, client.id);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Payment installment recorded!');
        setTimeout(() => {
          setIsRecordPaymentOpen(false);
          setSuccessMsg(null);
        }, 1500);
      }
    });
  };

  // Handle Note Submission
  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const noteText = (new FormData(form)).get('note') as string;

    if (!noteText || noteText.trim().length === 0) return;

    const res = await addNoteAction(client.id, noteText);
    if (!res.error) {
      form.reset();
    }
  };

  // Handle Dynamic filing creation for other Assessment Years
  const handleCreateFilingForAY = async (ay: string) => {
    if (confirm(`Do you want to initialize the ITR filing workflow for Assessment Year ${ay}?`)) {
      const res = await createFilingForAYAction(client.id, ay);
      if (res.error) {
        alert(res.error);
      }
    }
  };

  const handleCreateRevisedReturn = async () => {
    if (confirm(`Do you want to initialize a Revised Return filing for Assessment Year ${selectedAY}?`)) {
      const res = await createRevisedFilingAction(client.id, selectedAY);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedFilingId(null);
      }
    }
  };

  const handleUploadDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentFiling) return;
    const formData = new FormData(e.currentTarget);
    formData.append('clientId', client.id);
    formData.append('filingId', currentFiling.id);
    formData.append('assessmentYear', selectedAY);

    setIsUploading(true);
    setDocMessage(null);

    try {
      const res = await uploadDocumentAction(formData);
      if (res.error) {
        setDocMessage({ type: 'error', text: res.error });
      } else {
        setDocMessage({ type: 'success', text: res.message || 'File uploaded successfully!' });
        e.currentTarget.reset();
      }
    } catch (err: any) {
      setDocMessage({ type: 'error', text: err.message || 'An error occurred during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = async (docId: string, originalFileName: string, shouldDownload = false) => {
    try {
      const res = await getSignedUrlAction(docId);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.signedUrl) {
        if (shouldDownload) {
          const a = document.createElement('a');
          a.href = res.signedUrl;
          a.download = originalFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(res.signedUrl, '_blank');
        }
      }
    } catch (err: any) {
      alert('Error opening document: ' + err.message);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document?')) return;
    try {
      const res = await deleteDocumentAction(docId, client.id);
      if (res.error) {
        alert(res.error);
      } else {
        setDocMessage({ type: 'success', text: res.message || 'Document deleted successfully!' });
      }
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  // Mask string helper
  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Client Header Profile (Obfuscated fields + eye icons) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 relative z-10">
          <div>
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 rounded-full">
              Client Profile
            </span>
            <h1 className="text-3xl font-black text-white mt-2 tracking-tight">{client.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-400">
              {/* PAN */}
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-500">PAN:</span>
                <span className="font-mono font-bold text-white tracking-wide">
                  {maskText(client.pan, isPrivacyMode && !revealPan)}
                </span>
                {isPrivacyMode && (
                  <button onClick={() => setRevealPan(!revealPan)} className="text-slate-500 hover:text-slate-300">
                    {revealPan ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button onClick={() => copyToClipboard(client.pan, 'pan')} className="text-slate-500 hover:text-white">
                  {copiedField === 'pan' ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Mobile */}
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                <span>{maskText(client.mobile, isPrivacyMode && !revealMobile)}</span>
                {isPrivacyMode && (
                  <button onClick={() => setRevealMobile(!revealMobile)} className="text-slate-500 hover:text-slate-300">
                    {revealMobile ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button onClick={() => copyToClipboard(client.mobile, 'mobile')} className="text-slate-500 hover:text-white">
                  {copiedField === 'mobile' ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Email */}
              {client.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{maskText(client.email, isPrivacyMode && !revealEmail)}</span>
                  {isPrivacyMode && (
                    <button onClick={() => setRevealEmail(!revealEmail)} className="text-slate-500 hover:text-slate-300">
                      {revealEmail ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>ITR Login Assistant</span>
            </button>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 cursor-pointer transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleDeleteClient}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-red-950/20 border border-red-900/30 hover:border-red-500/50 hover:bg-red-900/10 rounded-xl text-xs font-semibold text-red-400 cursor-pointer transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Delete Client</span>
            </button>
          </div>
        </div>

        {/* Credentials details quick bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/40">
            <div className="flex items-center space-x-3">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">ITR Portal Password:</span>
              <span className="font-mono font-bold text-white tracking-wider">
                {decrypting ? 'Decrypting...' : showPassword ? (decryptedPassword || '••••••••') : '••••••••'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={handleRevealPassword} 
                disabled={decrypting}
                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              {decryptedPassword && (
                <button 
                  type="button" 
                  onClick={() => copyToClipboard(decryptedPassword, 'pw')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white cursor-pointer"
                >
                  {copiedField === 'pw' ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/40">
            <div className="flex items-center space-x-3">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Intimation PDF PW:</span>
              <span className="font-mono font-bold text-blue-400 tracking-wider">
                {maskText(intimationPassword, isPrivacyMode && !revealIntimationPassword)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isPrivacyMode && (
                <button 
                  type="button" 
                  onClick={() => setRevealIntimationPassword(!revealIntimationPassword)} 
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {revealIntimationPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              )}
              <button 
                type="button" 
                onClick={() => copyToClipboard(intimationPassword, 'intpw')}
                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white cursor-pointer"
              >
                {copiedField === 'intpw' ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary detail sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Case Filing details & Documents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ITR Case Filing Status block */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/40">
              <div>
                <h2 className="text-lg font-bold text-white">ITR Case Status (AY {selectedAY})</h2>
                {/* Version Selector Dropdown */}
                {ayFilings.length > 1 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filing Version:</span>
                    <select
                      value={currentFiling?.id || ''}
                      onChange={(e) => setSelectedFilingId(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/55 cursor-pointer"
                    >
                      {ayFilings.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.return_type} {f.revision_number > 0 ? `(Rev ${f.revision_number})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto">
                {currentFiling && (
                  <button
                    onClick={handleCreateRevisedReturn}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-850 hover:border-indigo-700 rounded-xl text-xs font-bold text-indigo-300 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Revised Return</span>
                  </button>
                )}
                {currentFiling ? (
                  <button
                    onClick={() => setIsUpdateFilingOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-350 border border-slate-800 cursor-pointer transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Update Details</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateFilingForAY(selectedAY)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Start AY Filing</span>
                  </button>
                )}
              </div>
            </div>

            {currentFiling ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Filing Status</span>
                  <span className="px-2.5 py-0.5 inline-block bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/15 mt-1">
                    {currentFiling.filing_status}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">ITR Type</span>
                  <span className="font-semibold text-white mt-1 block">{currentFiling.itr_type || '-'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Filing Date</span>
                  <span className="text-slate-300 mt-1 block">
                    {currentFiling.filing_date 
                      ? new Date(currentFiling.filing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ack Number</span>
                  <span className="font-mono text-slate-300 mt-1 block max-w-[120px] truncate" title={currentFiling.acknowledgement_number || ''}>
                    {currentFiling.acknowledgement_number || '-'}
                  </span>
                </div>
                
                <div className="col-span-2 sm:col-span-2 pt-4 border-t border-slate-800/40">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Intimation status</span>
                  <span className="font-semibold text-white mt-1 block">{currentFiling.intimation_status || '-'}</span>
                </div>
                <div className="pt-4 border-t border-slate-800/40">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Refund status</span>
                  <span className="font-semibold text-white mt-1 block">{currentFiling.refund_status || '-'}</span>
                </div>
                <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Refund Amount</span>
                    <span className="font-bold text-emerald-400 mt-1 block">
                      ₹{maskText(Number(currentFiling.refund_amount || 0).toLocaleString('en-IN'), isPrivacyMode && !revealRefund)}
                    </span>
                  </div>
                  {isPrivacyMode && (
                    <button
                      type="button"
                      onClick={() => setRevealRefund(!revealRefund)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-350 cursor-pointer mt-4"
                      title="Toggle Refund Privacy"
                    >
                      {revealRefund ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <Clock className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs">No active filing records exists for Assessment Year {selectedAY}.</p>
              </div>
            )}
          </div>

          {/* Client Documents block (Supabase Storage) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Client Documents (AY {selectedAY})</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage tax return PDF, computation, and reference documents.</p>
              </div>
            </div>

            {docMessage && (
              <div className={`mb-4 p-3 border rounded-xl text-xs flex items-center justify-between ${
                docMessage.type === 'success' 
                  ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                  : 'bg-red-950/20 border-red-900/30 text-red-400'
              }`}>
                <span>{docMessage.text}</span>
                <button type="button" onClick={() => setDocMessage(null)} className="text-slate-500 hover:text-slate-350 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Upload form if filing exists */}
            {currentFiling ? (
              <form onSubmit={handleUploadDocument} className="flex flex-col md:flex-row gap-3 items-end p-4 bg-slate-950/20 border border-slate-850 rounded-2xl mb-6 select-none">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Doc Type</label>
                  <select
                    name="documentType"
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-slate-700"
                  >
                    <option value="itr-v">ITR-V Acknowledgement</option>
                    <option value="intimation-order">Intimation Order (143(1))</option>
                    <option value="form-16">Form 16</option>
                    <option value="computation">Computation</option>
                    <option value="tax-report">Tax Report</option>
                    <option value="acknowledgement">Acknowledgement</option>
                    <option value="other">Other Document</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Select File</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 file:cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full md:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white rounded-xl cursor-pointer transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </button>
              </form>
            ) : null}

            {/* Documents Grid */}
            {currentFiling?.filing_documents && currentFiling.filing_documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentFiling.filing_documents.map((doc: any) => {
                  const isIntimation = doc.document_type === 'intimation-order';
                  const sizeMB = (doc.file_size / (1024 * 1024)).toFixed(2);
                  
                  const docTypeLabels: Record<string, string> = {
                    'itr-v': 'ITR V Acknowledgement',
                    'intimation-order': 'Intimation Order (143(1))',
                    'form-16': 'Form 16',
                    'computation': 'Computation',
                    'tax-report': 'Tax Report',
                    'acknowledgement': 'Acknowledgement',
                    'other': 'Other Document'
                  };
                  
                  return (
                    <div key={doc.id} className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3.5 shrink-0 min-w-0 max-w-[80%]">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            doc.document_type === 'itr-v' ? 'bg-blue-500/10 text-blue-400' :
                            doc.document_type === 'intimation-order' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="truncate">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {docTypeLabels[doc.document_type] || doc.document_type}
                            </h4>
                            <span className="text-xs text-white font-medium block mt-1 truncate" title={doc.original_file_name}>
                              {doc.original_file_name}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {sizeMB} MB
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleViewDocument(doc.id, doc.original_file_name, false)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="View file"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewDocument(doc.id, doc.original_file_name, true)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-red-400 hover:text-red-350 transition-colors cursor-pointer"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {isIntimation && (
                        <div className="mt-1 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-1 text-slate-400">
                            <span>PDF Password:</span>
                            <span className="font-mono font-bold text-blue-400">{intimationPassword}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(intimationPassword, 'intdocpw')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedField === 'intdocpw' ? (
                              <ClipboardCheck className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <FileText className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs">No documents uploaded for this Assessment Year.</p>
              </div>
            )}
          </div>

          {/* Billing & Invoice History block */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Billing & Payments (AY {selectedAY})</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Installment records and outstanding invoice status.</p>
              </div>
              <div className="flex items-center space-x-2">
                {isPrivacyMode && (
                  <button
                    type="button"
                    onClick={() => setRevealBilling(!revealBilling)}
                    className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-500 hover:text-white rounded-xl cursor-pointer transition-colors"
                    title="Toggle Billing Privacy"
                  >
                    {revealBilling ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
                {currentInvoice && (
                  <button
                    onClick={() => setIsRecordPaymentOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow-lg cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>
            </div>

            {currentInvoice ? (
              <div className="space-y-6">
                {/* Invoice summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl text-xs font-semibold text-slate-400">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider mb-1">Invoice No</span>
                    <span className="text-white font-mono">{currentInvoice.invoice_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider mb-1">Billed Charge</span>
                    <span className="text-white font-bold text-sm">₹{maskText(Number(currentInvoice.settlement_amount).toLocaleString('en-IN'), isPrivacyMode && !revealBilling)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider mb-1">Received Amt</span>
                    <span className="text-white font-bold text-sm">₹{maskText(Number(currentInvoice.amount_received).toLocaleString('en-IN'), isPrivacyMode && !revealBilling)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider mb-1">Status</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full mt-0.5 inline-block ${
                      currentInvoice.payment_status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : currentInvoice.payment_status === 'Partial'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {currentInvoice.payment_status}
                    </span>
                  </div>
                </div>

                {/* Payments list table */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Installments Received</h4>
                    {isPrivacyMode && (
                      <button
                        type="button"
                        onClick={() => setRevealPayment(!revealPayment)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-350 cursor-pointer"
                        title="Toggle Payments Privacy"
                      >
                        {revealPayment ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  {currentPayments && currentPayments.length > 0 ? (
                    <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-950/20">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800/80 bg-slate-900/10 text-slate-400 font-semibold">
                            <th className="p-3">Payment Date</th>
                            <th className="p-3">Mode</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {currentPayments.map((p) => (
                            <tr key={p.id} className="text-slate-300">
                              <td className="p-3">
                                {new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="p-3 font-semibold text-white">{p.payment_mode}</td>
                              <td className="p-3 font-bold text-white">₹{maskText(Number(p.amount).toLocaleString('en-IN'), isPrivacyMode && !revealPayment)}</td>
                              <td className="p-3 text-slate-400">{p.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">No payments received for this Assessment Year yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No invoice generated for this AY.</p>
            )}
          </div>

        </div>

        {/* Right Side: Assessment Year Switcher & Personal Info */}
        <div className="space-y-6">
          
          {/* AY Switcher */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Select Assessment Year</h2>
            <div className="space-y-2">
              {ayList.map((ay) => {
                const isSelected = ay === selectedAY;
                const hasFiling = filings.some(f => f.assessment_year === ay);

                return (
                  <div key={ay} className="flex items-center justify-between">
                    <Link
                      href={`/clients/${client.id}?ay=${ay}`}
                      className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <span>AY {ay}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {hasFiling ? 'Active Filing' : 'No Record'}
                      </span>
                    </Link>
                    {!hasFiling && (
                      <button
                        onClick={() => handleCreateFilingForAY(ay)}
                        title="Initialize Filing for this AY"
                        className="ml-2 p-3 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
            <h2 className="text-sm font-bold text-white normal-case mb-2">Personal Details</h2>
            
            <div>
              <span className="text-slate-500 block mb-1">Aadhaar Card</span>
              <span className="text-white text-sm font-semibold tracking-wider font-mono">
                {client.aadhaar ? maskText(client.aadhaar, isPrivacyMode && !revealPan) : '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Family Group</span>
              <span className="text-white text-sm normal-case font-bold">{client.family_group || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Residential Address</span>
              <span className="text-slate-300 text-xs normal-case font-medium leading-relaxed block">
                {client.address ? maskText(client.address, isPrivacyMode && !revealAddress) : '-'}
              </span>
              {client.address && isPrivacyMode && (
                <button
                  onClick={() => setRevealAddress(!revealAddress)}
                  className="mt-2 normal-case text-slate-500 hover:text-slate-300 text-[10px] font-semibold flex items-center space-x-1"
                >
                  {revealAddress ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{revealAddress ? 'Hide Address' : 'Reveal Address'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Timeline Activity Feed at the Bottom (with Note Form) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-6">Activity Timeline & Notes</h2>
        
        {/* Add note text editor */}
        <form onSubmit={handleAddNote} className="mb-8 bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl flex items-center space-x-3">
          <input
            type="text"
            name="note"
            required
            placeholder="Add a timeline note for this client..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-slate-500"
          />
          <button
            type="submit"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
          >
            <Send className="h-3 w-3" />
            <span>Post</span>
          </button>
        </form>

        {/* Timeline timeline */}
        {activityLogs && activityLogs.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {activityLogs.map((log, logIdx) => {
                const date = new Date(log.created_at);
                const day = String(date.getDate()).padStart(2, '0');
                const month = date.toLocaleDateString('en-IN', { month: 'short' });
                const year = date.getFullYear();
                const formattedDate = `${day}-${month}-${year}`;

                return (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== activityLogs.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800/60" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-4">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 ring-4 ring-slate-900/40">
                            {log.action_type === 'Note Added' ? (
                              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                            ) : log.action_type === 'Payment Received' ? (
                              <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{formattedDate}</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{log.action_type}</p>
                          <p className="text-sm text-slate-300 mt-1">{log.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-8 text-center">No timeline history recorded yet.</p>
        )}
      </div>

      {/* Edit Profile slide over */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Edit Client Profile</h2>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="edit-client-form" onSubmit={handleEditProfile} className="py-6 space-y-5">
                {successMsg && <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs">{successMsg}</div>}
                {errorMsg && <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-xl text-red-200 text-xs">{errorMsg}</div>}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" name="name" defaultValue={client.name} required className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/40" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input type="tel" name="mobile" defaultValue={client.mobile} required className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                    <input type="text" name="dob" defaultValue={formatDOBToDDMMYYYY(client.dob)} placeholder="DD-MM-YYYY" required className="w-full px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input type="email" name="email" defaultValue={client.email || ''} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar Card</label>
                    <input type="text" name="aadhaar" defaultValue={client.aadhaar || ''} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Family Group</label>
                    <input type="text" name="family_group" defaultValue={client.family_group || ''} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Queue Status</label>
                    <select name="is_excluded_from_queue" defaultValue={String(client.is_excluded_from_queue)} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                      <option value="false">Active in Queue</option>
                      <option value="true">Excluded from Queue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Override ITR Portal Password</label>
                  <input type="text" name="password" placeholder="Leave empty to keep current password" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                  <textarea name="address" rows={2} defaultValue={client.address || ''} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm resize-none" />
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end space-x-3">
              <button onClick={() => setIsEditProfileOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" form="edit-client-form" disabled={isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">Record Cash/UPI Payment</h2>
            
            <form id="record-payment-form" onSubmit={handleRecordPayment} className="space-y-4">
              {successMsg && <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs">{successMsg}</div>}
              {errorMsg && <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-xl text-red-200 text-xs">{errorMsg}</div>}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Outstanding Balance</label>
                <input type="text" disabled value={`₹${Number(currentInvoice.outstanding_amount).toLocaleString('en-IN')}`} className="w-full px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Amount *</label>
                <input type="number" name="amount" required min={1} max={currentInvoice.outstanding_amount} placeholder="₹ Enter amount" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Mode</label>
                  <select name="payment_mode" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Date</label>
                  <input type="date" name="payment_date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
                <input type="text" name="notes" placeholder="e.g. UPI transaction ID / Ref" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
              </div>
            </form>

            <div className="mt-6 flex justify-end space-x-3 border-t border-slate-800 pt-4">
              <button onClick={() => setIsRecordPaymentOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold">Cancel</button>
              <button type="submit" form="record-payment-form" disabled={isPending} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Filing Modal */}
      {isUpdateFilingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-805 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Update Filing Details (AY {selectedAY})</h2>
                <button onClick={() => setIsUpdateFilingOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="update-filing-form" onSubmit={handleUpdateFiling} className="py-6 space-y-5 text-slate-200">
                {successMsg && <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs">{successMsg}</div>}
                {errorMsg && <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-xl text-red-200 text-xs">{errorMsg}</div>}

                {/* Workflow Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Filing Workflow Status</label>
                    <select name="filing_status" defaultValue={currentFiling.filing_status} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                      <option value="Yet To File">Yet To File</option>
                      <option value="Documents Pending">Documents Pending</option>
                      <option value="Ready to File">Ready to File</option>
                      <option value="Filed">Filed</option>
                      <option value="Under Processing">Under Processing</option>
                      <option value="Processed">Processed</option>
                      <option value="Rectification Required">Rectification Required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ITR Form Type</label>
                    <select name="itr_type" defaultValue={currentFiling.itr_type || 'ITR-1'} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                      <option value="ITR-1">ITR-1</option>
                      <option value="ITR-2">ITR-2</option>
                      <option value="ITR-3">ITR-3</option>
                      <option value="ITR-4">ITR-4</option>
                      <option value="ITR-5">ITR-5</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Filing Date</label>
                    <input type="date" name="filing_date" defaultValue={currentFiling.filing_date || ''} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Acknowledgement No</label>
                    <input type="text" name="acknowledgement_number" defaultValue={currentFiling.acknowledgement_number || ''} placeholder="15-digit Ack No" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Refund Amount</label>
                    <input type="number" name="refund_amount" defaultValue={currentFiling.refund_amount || 0} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Refund Status</label>
                    <select name="refund_status" defaultValue={currentFiling.refund_status || 'Yet to receive'} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                      <option value="Yet to receive">Yet to receive</option>
                      <option value="Received">Received</option>
                      <option value="Adjusted against Demand">Adjusted against Demand</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Refund Received Date</label>
                    <input type="date" name="refund_received_date" defaultValue={currentFiling.refund_received_date || ''} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Intimation Order Status</label>
                    <select name="intimation_status" defaultValue={currentFiling.intimation_status || 'Not Received'} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                      <option value="Not Received">Not Received</option>
                      <option value="Received">Received</option>
                      <option value="Refund Determined">Refund Determined</option>
                      <option value="Demand Raised">Demand Raised</option>
                      <option value="No Demand No Refund">No Demand No Refund</option>
                      <option value="Rectification Required">Rectification Required</option>
                      <option value="Under Processing">Under Processing</option>
                    </select>
                  </div>
                </div>

                {/* Billing fields */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-3">Billing Adjustments (No GST)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Filing Fee (₹)</label>
                      <input type="number" name="filing_charge" defaultValue={currentInvoice?.filing_charge || 0} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Refund Fee (%)</label>
                      <input type="number" name="refund_charge_pct" defaultValue={currentInvoice?.refund_charge_pct || 0} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Discount (₹)</label>
                      <input type="number" name="discount" defaultValue={currentInvoice?.discount || 0} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end space-x-3">
              <button onClick={() => setIsUpdateFilingOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" form="update-filing-form" disabled={isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50">
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portal Login Assistant Modal (shows credentials summary) */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-6">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">ITR Login Assistant</h2>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-400 text-xs mb-6 normal-case font-medium leading-relaxed">
              Use these values to log in to the Income Tax Department portal or open locked Intimation PDFs. Click to copy fields instantly.
            </p>

            <div className="space-y-4">
              {/* PAN */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PAN (Username)</span>
                  <span className="text-sm font-mono font-bold text-white tracking-wider">{client.pan.toUpperCase()}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(client.pan.toUpperCase(), 'aspan')}
                  className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  {copiedField === 'aspan' ? <ClipboardCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Password */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ITR Portal Password</span>
                  <span className="text-sm font-mono font-bold text-white tracking-wider">
                    {decrypting ? 'Decrypting...' : (decryptedPassword || '••••••••')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {!decryptedPassword && (
                    <button 
                      onClick={handleRevealPassword} 
                      disabled={decrypting}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-blue-400 border border-slate-800 rounded-xl cursor-pointer"
                    >
                      Decrypt
                    </button>
                  )}
                  {decryptedPassword && (
                    <button 
                      onClick={() => copyToClipboard(decryptedPassword, 'aspw')}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      {copiedField === 'aspw' ? <ClipboardCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Intimation Password */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Intimation PDF Password (PAN + DOB)</span>
                  <span className="text-sm font-mono font-bold text-blue-400 tracking-wider">{intimationPassword}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(intimationPassword, 'asintpw')}
                  className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  {copiedField === 'asintpw' ? <ClipboardCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs text-slate-400">
              <a 
                href="https://eportal.incometax.gov.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-white hover:underline text-blue-400"
              >
                <span>Open Income Tax Portal</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <button 
                onClick={() => setIsAssistantOpen(false)} 
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
