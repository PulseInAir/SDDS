'use client';

import { useState, useTransition, useEffect } from 'react';
import Papa from 'papaparse';
import { importClientsCSVAction, triggerQueueRolloverAction } from '../clients/actions';
import {
  Upload, CheckCircle, AlertTriangle, FileText, Database, ShieldAlert,
  HelpCircle, Play, Loader2, RefreshCw, Copy, Check, Download, Users, Briefcase, Bell
} from 'lucide-react';

interface DataManagerClientProps {
  ayList: string[];
  currentAY: string;
  clientsData: any[];
  invoicesData: any[];
  filingsData: any[];
  revenueData: any[];
}

export default function DataManagerClient({
  ayList,
  currentAY,
  clientsData,
  invoicesData,
  filingsData,
  revenueData
}: DataManagerClientProps) {
  const [selectedAY, setSelectedAY] = useState(currentAY);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Import Results State
  const [importResults, setImportResults] = useState<{
    successCount: number;
    failCount: number;
    errors: string[];
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRolloverPending, startRolloverTransition] = useTransition();
  const [rolloverResult, setRolloverResult] = useState<string | null>(null);

  // Backup Reminder
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('sdds_last_backup_date');
    if (stored) setLastBackupDate(stored);
  }, []);

  const markBackupDone = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('sdds_last_backup_date', today);
    setLastBackupDate(today);
  };

  const getDaysSinceBackup = () => {
    if (!lastBackupDate) return 999;
    const diffTime = Math.abs(new Date().getTime() - new Date(lastBackupDate).getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Schema copying
  const [copiedText, setCopiedText] = useState(false);
  const schemaCSVTemplate = "Client Name,PAN,Mobile,Date of Birth,ITR Portal Password,Email,Aadhaar Card,Filing Fee,Amount Received,Payment Mode,ITR Form Type,Filing Workflow Status";

  const copyTemplateToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schemaCSVTemplate);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy template:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setImportResults(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file.');
      return;
    }

    setCsvFile(file);

    // Parse preview of first 5 rows
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        const data = results.data as any[];
        if (data && data.length > 0) {
          setPreviewRows(data);
          setPreviewHeaders(Object.keys(data[0]));
        } else {
          setErrorMsg('The selected CSV file appears to be empty.');
        }
      },
      error: (err) => {
        setErrorMsg(`Failed to parse CSV preview: ${err.message}`);
      }
    });
  };

  const handleImportCSV = () => {
    if (!csvFile) return;
    setErrorMsg(null);
    setImportResults(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (!rows || rows.length === 0) {
          setErrorMsg('CSV contains no data to import.');
          return;
        }

        startTransition(async () => {
          try {
            const res = await importClientsCSVAction(rows, selectedAY) as any;
            if (res.error) {
              setErrorMsg(res.error);
            } else {
              setImportResults(res);
              setCsvFile(null);
              setPreviewRows([]);
              setPreviewHeaders([]);
            }
          } catch (err: any) {
            setErrorMsg(err.message || 'An unexpected error occurred during import.');
          }
        });
      },
      error: (err) => {
        setErrorMsg(`Failed to parse file: ${err.message}`);
      }
    });
  };

  const handleRollover = () => {
    if (confirm(`Do you want to run the automatic rollover check to enroll all previous AY clients into AY ${selectedAY}?`)) {
      startRolloverTransition(async () => {
        try {
          const res = await triggerQueueRolloverAction(selectedAY);
          if (res.error) {
            setRolloverResult(`Rollover failed: ${res.error}`);
          } else {
            setRolloverResult(res.message || 'Sync complete.');
          }
        } catch (err: any) {
          setRolloverResult(`Error occurred: ${err.message}`);
        }
      });
    }
  };

  // CSV Export logic
  const convertToCSV = (headers: string[], rows: any[][]) => {
    const escapeField = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = str.replace(/"/g, '""');
        return `"${str}"`;
      }
      return str;
    };

    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of rows) {
      csvRows.push(row.map(escapeField).join(','));
    }
    return csvRows.join('\r\n');
  };

  const triggerDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportClients = () => {
    const headers = [
      'Client ID', 'Client Name', 'PAN', 'Mobile', 'Date of Birth',
      'Email', 'Aadhaar Card', 'Address', 'Family Group', 'Excluded From Queue', 'Created At'
    ];
    const rows = clientsData.map(c => [
      c.id, c.name, c.pan, c.mobile, c.dob,
      c.email || '', c.aadhaar || '', c.address || '', c.family_group || '',
      c.is_excluded_from_queue ? 'Yes' : 'No', c.created_at
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportInvoices = () => {
    const headers = [
      'Invoice ID', 'Invoice Number', 'Client Name', 'PAN', 'Assessment Year',
      'Filing Charge', 'Refund Charge Pct', 'Refund Charge', 'Discount', 'Invoice Amount',
      'Settlement Amount', 'Amount Received', 'Outstanding Amount', 'Payment Status', 'Created At'
    ];
    const rows = invoicesData.map(i => [
      i.id,
      i.invoice_number,
      i.filings?.clients?.name || 'Unknown',
      i.filings?.clients?.pan || 'Unknown',
      i.assessment_year,
      i.filing_charge,
      i.refund_charge_pct || 0,
      i.refund_charge || 0,
      i.discount || 0,
      i.invoice_amount,
      i.settlement_amount,
      i.amount_received || 0,
      i.outstanding_amount || 0,
      i.payment_status,
      i.created_at
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportFilings = () => {
    const headers = [
      'Filing ID', 'Client Name', 'PAN', 'Assessment Year', 'ITR Form Type',
      'Filing Status', 'Filing Date', 'Acknowledgement Number', 'Return Type', 'Revision Number',
      'Refund Amount', 'Refund Status', 'Refund Received Date', 'Intimation Status', 'Created At'
    ];
    const rows = filingsData.map(f => [
      f.id,
      f.clients?.name || 'Unknown',
      f.clients?.pan || 'Unknown',
      f.assessment_year,
      f.itr_type || 'ITR-1',
      f.filing_status,
      f.filing_date || '',
      f.acknowledgement_number || '',
      f.return_type || 'Original',
      f.revision_number || 0,
      f.refund_amount || 0,
      f.refund_status || 'Yet to receive',
      f.refund_received_date || '',
      f.intimation_status,
      f.created_at
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `filings_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportRevenue = () => {
    const headers = [
      'Invoice ID', 'Invoice Number', 'Client Name', 'PAN', 'Assessment Year',
      'Invoice Date', 'Due Date', 'Invoice Amount', 'Settlement Amount',
      'Amount Received', 'Outstanding Amount', 'Payment Status', 'Created At'
    ];
    const rows = revenueData.map(r => [
      r.id,
      r.invoice_number,
      r.clients?.name || 'Unknown',
      r.clients?.pan || 'Unknown',
      r.assessment_year,
      r.invoice_date,
      r.due_date,
      r.invoice_amount,
      r.settlement_amount,
      r.amount_received,
      r.outstanding_amount,
      r.payment_status,
      r.created_at
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `revenue_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportPendingDues = () => {
    const pending = revenueData.filter(r => r.outstanding_amount > 0);
    const headers = [
      'Client Name', 'PAN', 'Mobile', 'Invoice Number', 'Assessment Year',
      'Invoice Date', 'Due Date', 'Settlement Amount', 'Outstanding Amount'
    ];
    const rows = pending.map(r => [
      r.clients?.name || 'Unknown',
      r.clients?.pan || 'Unknown',
      clientsData.find(c => c.id === r.client_id)?.mobile || '',
      r.invoice_number,
      r.assessment_year,
      r.invoice_date,
      r.due_date,
      r.settlement_amount,
      r.outstanding_amount
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `pending_dues_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportFiledReturns = () => {
    const filed = filingsData.filter(f => ['Filed', 'Under Processing', 'Processed', 'Post-Filing Exception'].includes(f.filing_status));
    const headers = [
      'Client Name', 'PAN', 'Assessment Year', 'Filing Status', 'Return Type',
      'Filing Date', 'Acknowledgement Number', 'ITR Form Type'
    ];
    const rows = filed.map(f => [
      f.clients?.name || 'Unknown',
      f.clients?.pan || 'Unknown',
      f.assessment_year,
      f.filing_status,
      f.return_type || 'Original',
      f.filing_date || '',
      f.acknowledgement_number || '',
      f.itr_type || 'ITR-1'
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `filed_returns_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportNotices = () => {
    // Assuming 'Exception' group statuses represent notices
    const notices = filingsData.filter(f => ['Defective Return', 'Rectification Required', 'Demand Notice', 'Post-Filing Exception'].includes(f.filing_status));
    const headers = [
      'Client Name', 'PAN', 'Mobile', 'Assessment Year', 'Filing Status', 'Return Type'
    ];
    const rows = notices.map(f => [
      f.clients?.name || 'Unknown',
      f.clients?.pan || 'Unknown',
      clientsData.find(c => c.id === f.client_id)?.mobile || '',
      f.assessment_year,
      f.filing_status,
      f.return_type || 'Original'
    ]);
    const csvContent = convertToCSV(headers, rows);
    triggerDownload(csvContent, `notices_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportFullBackup = () => {
    exportClients();
    setTimeout(exportFilings, 500);
    setTimeout(exportInvoices, 1000);
    setTimeout(exportRevenue, 1500);
    markBackupDone();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left side: CSV Bulk Importer & Rollover */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Bulk Client Importer Box */}
        <div className="sdds-blue-card border border-blue-800/40 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                <span>Bulk Client Importer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Upload CSV spreadsheets to register clients and enrol filings.</p>
            </div>
            
            {/* AY Select Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filing AY:</span>
              <select
                value={selectedAY}
                onChange={(e) => setSelectedAY(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/55 cursor-pointer"
              >
                {ayList.map((ay) => (
                  <option key={ay} value={ay}>
                    AY {ay}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Drag & Drop Area */}
          <div className="border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-950/20 text-center hover:border-slate-700 transition-all relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isPending}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <Upload className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">
                  {csvFile ? csvFile.name : 'Select or drag ITR Client spreadsheet'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'Only CSV (.csv) files are supported'}
                </p>
              </div>
            </div>
          </div>

          {/* Local Status Message / Errors */}
          {errorMsg && (
            <div className="mt-4 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-start space-x-3 text-red-400 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Import Results Summary */}
          {importResults && (
            <div className="mt-6 p-5 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Import Operations Complete!</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                  <span className="text-slate-500 block mb-1 text-[10px]">Imported Successfully</span>
                  <span className="text-xl font-black text-emerald-400">{importResults.successCount}</span>
                </div>
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                  <span className="text-slate-500 block mb-1 text-[10px]">Errors / Excluded Rows</span>
                  <span className="text-xl font-black text-red-400">{importResults.failCount}</span>
                </div>
              </div>

              {/* Error Detail Log */}
              {importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Failure Log Feed</span>
                  <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-900 p-3.5 rounded-xl font-mono text-[11px] text-slate-400 space-y-1 divide-y divide-slate-900/40">
                    {importResults.errors.map((err, i) => (
                      <div key={i} className="pt-1.5 flex items-start space-x-2 text-red-300">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CSV File Content Preview Table */}
          {previewRows.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">File Header Preview (First 5 Rows)</span>
                <button
                  onClick={handleImportCSV}
                  disabled={isPending}
                  className="flex items-center space-x-1.5 px-4.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span>{isPending ? 'Importing Records...' : `Import into AY ${selectedAY}`}</span>
                </button>
              </div>

              <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[11px] text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/20 text-slate-500 font-bold uppercase tracking-wider">
                        {previewHeaders.slice(0, 5).map((h) => (
                          <th key={h} className="p-3 whitespace-nowrap">{h}</th>
                        ))}
                        {previewHeaders.length > 5 && <th className="p-3 text-slate-500">+ {previewHeaders.length - 5} columns</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {previewRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {previewHeaders.slice(0, 5).map((h) => (
                            <td key={h} className="p-3 font-medium truncate max-w-[120px]">{row[h] || '-'}</td>
                          ))}
                          {previewHeaders.length > 5 && <td className="p-3 text-slate-500 font-bold">...</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Client Filing Rollover Card */}
        <div className="sdds-blue-card border border-blue-800/40 rounded-3xl p-6 relative">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-400" />
              <span>Filing Queue Rollover Tool</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enrolls clients who had filings in previous Assessment Years into the current active filing queue for the selected year.
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
            <div className="text-xs font-semibold text-slate-400">
              Target Assessment Year: <span className="text-blue-400 font-bold">AY {selectedAY}</span>
            </div>
            <button
              onClick={handleRollover}
              disabled={isRolloverPending}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs font-bold text-slate-200 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isRolloverPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>{isRolloverPending ? 'Processing Rollover...' : 'Run Queue Rollover Sync'}</span>
            </button>
          </div>

          {rolloverResult && (
            <div className="mt-4 p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300">
              Result: <span className="text-emerald-400">{rolloverResult}</span>
            </div>
          )}
        </div>

        {/* CSV Format Schema Guide */}
        <div className="sdds-blue-card border border-blue-800/40 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                <span>Spreadsheet Column Reference</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Ensure headers map properly. Unmatched columns are safely skipped.</p>
            </div>
            
            <button
              onClick={copyTemplateToClipboard}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-semibold text-slate-300 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
            >
              {copiedText ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Template Headers!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Copy Headers Template</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-950/20">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/10 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Column Name</th>
                    <th className="p-3">Mandatory?</th>
                    <th className="p-3">Example Values</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-400">
                  <tr className="text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">Client Name</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3">Rahul Sharma</td>
                    <td className="p-3 text-slate-500">Legal name of client. Defaults to 'Unnamed Client' if blank.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">PAN</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3 font-mono">ABCDE1234F</td>
                    <td className="p-3 text-slate-500">10-digit PAN. If blank/invalid, a unique temporary PAN (e.g. TEMP1234AB) is generated.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">Mobile</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3">9876543210</td>
                    <td className="p-3 text-slate-500">Active contact number. Defaults to empty if blank.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">Date of Birth</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3">31-01-1990</td>
                    <td className="p-3 text-slate-500">Date of birth in DD-MM-YYYY format. Defaults to '01-01-1900' if blank.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">ITR Portal Password</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3 font-mono">abcde*1234F</td>
                    <td className="p-3 text-slate-500">ITR Portal login password. Defaults to a standard password formula based on PAN if blank.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">Filing Charge</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3">1200</td>
                    <td className="p-3 text-slate-500">ITR Filing Fee Charge. Defaults to 0 if blank.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Right side: Exports & Statistics */}
      <div className="space-y-6">
        
        {/* Export Data Box */}
        <div className="sdds-blue-card border border-blue-800/40 rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-400" />
              <span>Export Database Tables</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Export raw tables into formatted CSV spreadsheets locally.</p>
          </div>

          <div className="space-y-4">
            {getDaysSinceBackup() > 30 && (
              <div className="p-4 bg-amber-950/30 border border-amber-900/40 rounded-xl flex items-start space-x-3 text-amber-400 text-xs">
                <Bell className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Monthly Backup Recommended</p>
                  <p className="text-amber-500/80 mt-0.5">It has been {getDaysSinceBackup()} days since your last full backup. Regular backups ensure you have a copy of all records offline.</p>
                </div>
              </div>
            )}

            {/* Export Full Backup */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Full Offline Backup</span>
                <span className="text-xs text-white font-bold block">Download all DB tables</span>
                {lastBackupDate && <span className="text-[10px] text-slate-500 block">Last backup: {lastBackupDate}</span>}
              </div>
              <button
                onClick={exportFullBackup}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Backup Now</span>
              </button>
            </div>

            {/* Export Clients */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Clients Records</span>
                <span className="text-xs text-white font-bold block">{clientsData.length} entries registered</span>
              </div>
              <button
                onClick={exportClients}
                disabled={clientsData.length === 0}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-750 hover:border-slate-700 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Export Revenue */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Revenue / Collections</span>
                <span className="text-xs text-white font-bold block">{revenueData.length} invoices generated</span>
              </div>
              <button
                onClick={exportRevenue}
                disabled={revenueData.length === 0}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-750 hover:border-slate-700 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Export Pending Dues */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest block">Pending Dues</span>
                <span className="text-xs text-white font-bold block">Clients with outstanding balance</span>
              </div>
              <button
                onClick={exportPendingDues}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-amber-200 border border-slate-750 hover:border-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Export Filed Returns */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest block">Filed Returns</span>
                <span className="text-xs text-white font-bold block">All successfully filed ITRs</span>
              </div>
              <button
                onClick={exportFiledReturns}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-emerald-200 border border-slate-750 hover:border-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Export Notices / Exceptions */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest block">Notices & Exceptions</span>
                <span className="text-xs text-white font-bold block">Clients requiring attention</span>
              </div>
              <button
                onClick={exportNotices}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-red-200 border border-slate-750 hover:border-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5 text-red-400" />
                <span>Export CSV</span>
              </button>
            </div>

          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 leading-relaxed font-medium">
            <span className="font-bold text-white block mb-1">Export Instructions:</span>
            <p>CSVs are dynamically formatted in UTF-8. They are compatible with Microsoft Excel, Google Sheets, and standard tax preparation engines.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
