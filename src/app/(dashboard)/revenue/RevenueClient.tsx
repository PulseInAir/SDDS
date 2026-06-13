'use client';

import { useState, useMemo } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { 
  Search, Filter, Plus, Calendar, IndianRupee, FileText, User, 
  Tag, Download, Printer, CheckCircle, Clock, AlertTriangle, 
  AlertCircle, X, Check, Edit2, Trash2, ArrowUpRight, 
  ChevronLeft, ChevronRight, BarChart3, TrendingUp, Info, HelpCircle, Coins
} from 'lucide-react';
import {
  createRevenueInvoiceAction,
  editRevenueInvoiceAction,
  recordRevenuePaymentAction,
  waiveRevenueInvoiceAction,
  deleteRevenueInvoiceAction
} from './actions';

interface Client {
  id: string;
  name: string;
  pan: string;
  mobile: string;
}

interface Invoice {
  id: string;
  client_id: string;
  filing_id: string | null;
  invoice_number: string;
  financial_year: string;
  assessment_year: string;
  invoice_date: string;
  expected_payment_date: string;
  service_type: string;
  return_type: string | null;
  description: string | null;
  total_amount: number;
  waived_amount: number;
  amount_received: number;
  balance_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  clients?: Client | null;
}

interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  clients?: { name: string } | null;
  revenue_invoices?: { invoice_number: string } | null;
}

interface Filing {
  id: string;
  assessment_year: string;
  client_id: string;
  itr_type: string | null;
  filing_status: string;
  return_type: string;
}

interface RevenueClientProps {
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  filings: Filing[];
}

const SERVICE_CATEGORIES = [
  'ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7',
  'Notice Reply', 'Rectification', 'Appeal', 'Tax Consultation',
  'Form 16 Processing', 'AIS/TIS Review', 'Refund Follow-up', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'];

export default function RevenueClient({ clients, invoices, payments, filings }: RevenueClientProps) {
  const { isPrivacyMode } = usePrivacy();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'kpis'>('dashboard');

  // Filter States
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedAY, setSelectedAY] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [selectedReturnType, setSelectedReturnType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Submitting States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    filing_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    service_type: 'ITR-1',
    return_type: 'Original',
    description: '',
    total_amount: '',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    client_id: '',
    amount: '',
    payment_method: 'UPI',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    id: '',
    invoice_date: '',
    expected_payment_date: '',
    service_type: '',
    return_type: '',
    description: '',
    total_amount: '',
    notes: ''
  });

  // Extract unique filtering options from dataset
  const fyOptions = useMemo(() => Array.from(new Set(invoices.map(i => i.financial_year))).sort().reverse(), [invoices]);
  const ayOptions = useMemo(() => Array.from(new Set(invoices.map(i => i.assessment_year))).sort().reverse(), [invoices]);
  const monthOptions = useMemo(() => {
    const set = new Set(invoices.map(i => i.invoice_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [invoices]);

  // Privacy formatting helpers
  const fmtAmt = (val: number) => {
    if (isPrivacyMode) return '₹••••';
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fmtPercent = (val: number) => {
    if (isPrivacyMode) return '••%';
    return `${val.toFixed(1)}%`;
  };

  // Payment Method Filter lookup
  const invoiceIdsWithPaymentMethod = useMemo(() => {
    if (!selectedPaymentMethod) return null;
    return new Set(
      payments
        .filter(p => p.payment_method === selectedPaymentMethod)
        .map(p => p.invoice_id)
    );
  }, [payments, selectedPaymentMethod]);

  // Filter Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      if (selectedFY && invoice.financial_year !== selectedFY) return false;
      if (selectedAY && invoice.assessment_year !== selectedAY) return false;
      if (selectedMonth && invoice.invoice_date.slice(0, 7) !== selectedMonth) return false;
      if (selectedClientId && invoice.client_id !== selectedClientId) return false;
      if (selectedServiceType && invoice.service_type !== selectedServiceType) return false;
      if (selectedReturnType && invoice.return_type !== selectedReturnType) return false;
      if (selectedStatus && invoice.status !== selectedStatus) return false;
      if (invoiceIdsWithPaymentMethod && !invoiceIdsWithPaymentMethod.has(invoice.id)) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const clientName = invoice.clients?.name?.toLowerCase() || '';
        const pan = invoice.clients?.pan?.toLowerCase() || '';
        const invNum = invoice.invoice_number?.toLowerCase() || '';
        if (!clientName.includes(q) && !pan.includes(q) && !invNum.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, selectedFY, selectedAY, selectedMonth, selectedClientId, selectedServiceType, selectedReturnType, selectedStatus, invoiceIdsWithPaymentMethod, searchQuery]);

  // Filter Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (selectedClientId && p.client_id !== selectedClientId) return false;
      if (selectedPaymentMethod && p.payment_method !== selectedPaymentMethod) return false;
      if (selectedMonth && p.payment_date.slice(0, 7) !== selectedMonth) return false;

      const inv = invoices.find(i => i.id === p.invoice_id);
      if (!inv) return false;
      if (selectedFY && inv.financial_year !== selectedFY) return false;
      if (selectedAY && inv.assessment_year !== selectedAY) return false;
      if (selectedServiceType && inv.service_type !== selectedServiceType) return false;
      if (selectedReturnType && inv.return_type !== selectedReturnType) return false;
      
      return true;
    });
  }, [payments, invoices, selectedClientId, selectedPaymentMethod, selectedMonth, selectedFY, selectedAY, selectedServiceType, selectedReturnType]);

  // Pagination Calculations
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;

  // 10 Dashboard Core KPIs
  const totalBilled = useMemo(() => filteredInvoices.reduce((s, i) => s + Number(i.total_amount), 0), [filteredInvoices]);
  const totalReceived = useMemo(() => filteredPayments.reduce((s, p) => s + Number(p.amount), 0), [filteredPayments]);
  const pendingAmount = useMemo(() => filteredInvoices.reduce((s, i) => s + Number(i.balance_amount), 0), [filteredInvoices]);
  
  const overdueAmount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredInvoices
      .filter(i => i.status === 'Overdue' || (i.expected_payment_date < today && i.balance_amount > 0))
      .reduce((s, i) => s + Number(i.balance_amount), 0);
  }, [filteredInvoices]);

  const currentMonthRevenue = useMemo(() => {
    const curMonth = new Date().toISOString().slice(0, 7);
    return filteredPayments
      .filter(p => p.payment_date.slice(0, 7) === (selectedMonth || curMonth))
      .reduce((s, p) => s + Number(p.amount), 0);
  }, [filteredPayments, selectedMonth]);

  const currentFYRevenue = useMemo(() => {
    // Determine current FY string (e.g. "2026-27")
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const curFY = month >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;

    return filteredPayments
      .filter(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        return inv && inv.financial_year === (selectedFY || curFY);
      })
      .reduce((s, p) => s + Number(p.amount), 0);
  }, [filteredPayments, invoices, selectedFY]);

  const collectionRate = totalBilled > 0 ? (totalReceived / totalBilled) * 100 : 0;
  const avgFeePerReturn = filteredInvoices.length > 0 ? totalBilled / filteredInvoices.length : 0;

  const pendingByClient = useMemo(() => {
    const map: Record<string, { name: string; amount: number }> = {};
    filteredInvoices.forEach(inv => {
      const clientName = inv.clients?.name || 'Unknown';
      if (!map[inv.client_id]) {
        map[inv.client_id] = { name: clientName, amount: 0 };
      }
      map[inv.client_id].amount += Number(inv.balance_amount);
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [filteredInvoices]);

  const topPendingClient = pendingByClient[0]?.amount > 0 
    ? `${pendingByClient[0].name} (${fmtAmt(pendingByClient[0].amount)})` 
    : 'None';

  const totalPaidClients = useMemo(() => {
    return new Set(
      filteredInvoices
        .filter(i => i.status === 'Paid')
        .map(i => i.client_id)
    ).size;
  }, [filteredInvoices]);

  const statusCounts = useMemo(() => {
    const counts = { Paid: 0, PartPaid: 0, Unpaid: 0, Overdue: 0, Waived: 0 };
    filteredInvoices.forEach(i => {
      if (i.status === 'Paid') counts.Paid++;
      else if (i.status === 'Part Paid') counts.PartPaid++;
      else if (i.status === 'Overdue') counts.Overdue++;
      else if (i.status === 'Waived') counts.Waived++;
      else counts.Unpaid++;
    });
    const total = filteredInvoices.length || 1;
    return {
      ...counts,
      total,
      paidPct: (counts.Paid / total) * 100,
      partPaidPct: (counts.PartPaid / total) * 100,
      unpaidPct: (counts.Unpaid / total) * 100,
      overduePct: (counts.Overdue / total) * 100,
      waivedPct: (counts.Waived / total) * 100,
    };
  }, [filteredInvoices]);

  // Analytics Chart Data
  // 1. Last 6 Months Trends (Billed vs Received vs Pending)
  const last6MonthsData = useMemo(() => {
    const months = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const label = temp.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const key = temp.toISOString().slice(0, 7); // "YYYY-MM"
      months.push({ label, key });
    }

    return months.map(({ label, key }) => {
      const billed = filteredInvoices
        .filter(i => i.invoice_date.slice(0, 7) === key)
        .reduce((sum, i) => sum + Number(i.total_amount), 0);

      const received = filteredPayments
        .filter(p => p.payment_date.slice(0, 7) === key)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const pending = Math.max(0, billed - received);

      return { label, billed, received, pending };
    });
  }, [filteredInvoices, filteredPayments]);

  const maxChartVal = useMemo(() => {
    const max = Math.max(...last6MonthsData.map(d => Math.max(d.billed, d.received, d.pending)), 1000);
    return max;
  }, [last6MonthsData]);

  // 2. Service-wise breakdown
  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.forEach(i => {
      map[i.service_type] = (map[i.service_type] || 0) + Number(i.total_amount);
    });
    return Object.entries(map)
      .map(([service, amount]) => ({ service, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredInvoices]);

  // 3. Return Type Breakdown
  const returnTypeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.forEach(i => {
      const rt = i.return_type || 'Other/None';
      map[rt] = (map[rt] || 0) + Number(i.total_amount);
    });
    return Object.entries(map)
      .map(([rt, amount]) => ({ rt, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredInvoices]);

  // 4. Top 10 Clients by revenue
  const top10RevenueClients = useMemo(() => {
    const map: Record<string, { name: string; pan: string; billed: number; pending: number }> = {};
    filteredInvoices.forEach(i => {
      const cid = i.client_id;
      if (!map[cid]) {
        map[cid] = { 
          name: i.clients?.name || 'Unknown', 
          pan: i.clients?.pan || '', 
          billed: 0, 
          pending: 0 
        };
      }
      map[cid].billed += Number(i.total_amount);
      map[cid].pending += Number(i.balance_amount);
    });
    return Object.values(map)
      .sort((a, b) => b.billed - a.billed)
      .slice(0, 10);
  }, [filteredInvoices]);

  // ITR Practice Specific KPIs
  const returnsFiled = useMemo(() => filings.filter(f => f.filing_status !== 'Yet To File').length, [filings]);
  const returnsPending = useMemo(() => filings.filter(f => f.filing_status === 'Yet To File').length, [filings]);
  const clientsBilledCount = useMemo(() => new Set(invoices.map(i => i.client_id)).size, [invoices]);
  const clientsPaidCount = useMemo(() => new Set(invoices.filter(i => i.status === 'Paid').map(i => i.client_id)).size, [invoices]);
  const clientsPendingPaymentCount = useMemo(() => new Set(invoices.filter(i => i.balance_amount > 0).map(i => i.client_id)).size, [invoices]);
  const avgFeePerClient = clientsBilledCount > 0 ? (invoices.reduce((s, i) => s + Number(i.total_amount), 0) / clientsBilledCount) : 0;
  
  // Clients filed/not filed current FY (or selected FY if specified)
  const currentAYEquivalent = '2026-27'; // Can default to current
  const clientsFiledThisFY = useMemo(() => {
    return new Set(
      filings
        .filter(f => f.assessment_year === (selectedAY || currentAYEquivalent) && f.filing_status !== 'Yet To File')
        .map(f => f.client_id)
    ).size;
  }, [filings, selectedAY]);

  const clientsNotFiledThisFY = useMemo(() => {
    return Math.max(0, clients.length - clientsFiledThisFY);
  }, [clients, clientsFiledThisFY]);

  // Filtering Filings for active client when raising invoices
  const clientFilings = useMemo(() => {
    if (!invoiceForm.client_id) return [];
    return filings.filter(f => f.client_id === invoiceForm.client_id);
  }, [filings, invoiceForm.client_id]);

  // --- HANDLERS ---
  const handleOpenCreateModal = () => {
    setInvoiceForm({
      client_id: clients[0]?.id || '',
      filing_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      service_type: 'ITR-1',
      return_type: 'Original',
      description: '',
      total_amount: '',
      notes: ''
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setPaymentForm({
      invoice_id: invoice.id,
      client_id: invoice.client_id,
      amount: String(invoice.balance_amount),
      payment_method: 'UPI',
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      notes: ''
    });
    setActiveInvoice(invoice);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditModal = (invoice: Invoice) => {
    setEditForm({
      id: invoice.id,
      invoice_date: invoice.invoice_date,
      expected_payment_date: invoice.expected_payment_date,
      service_type: invoice.service_type,
      return_type: invoice.return_type || 'Original',
      description: invoice.description || '',
      total_amount: String(invoice.total_amount),
      notes: invoice.notes || ''
    });
    setActiveInvoice(invoice);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const amount = parseFloat(invoiceForm.total_amount);
    if (isNaN(amount) || amount < 0) {
      setErrorMsg('Please specify a valid non-negative fee amount.');
      setIsSubmitting(false);
      return;
    }

    const res = await createRevenueInvoiceAction({
      client_id: invoiceForm.client_id,
      filing_id: invoiceForm.filing_id || null,
      invoice_date: invoiceForm.invoice_date,
      service_type: invoiceForm.service_type,
      return_type: invoiceForm.return_type || null,
      description: invoiceForm.description || null,
      total_amount: amount,
      notes: invoiceForm.notes || null
    });

    setIsSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Invoice generated successfully.');
      setTimeout(() => setIsCreateModalOpen(false), 1000);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      setIsSubmitting(false);
      return;
    }

    const res = await recordRevenuePaymentAction({
      invoice_id: paymentForm.invoice_id,
      client_id: paymentForm.client_id,
      amount,
      payment_method: paymentForm.payment_method,
      payment_date: paymentForm.payment_date,
      reference_number: paymentForm.reference_number || null,
      notes: paymentForm.notes || null
    });

    setIsSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Payment recorded successfully.');
      setTimeout(() => setIsPaymentModalOpen(false), 1000);
    }
  };

  const handleEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const amount = parseFloat(editForm.total_amount);
    if (isNaN(amount) || amount < 0) {
      setErrorMsg('Please specify a valid non-negative fee amount.');
      setIsSubmitting(false);
      return;
    }

    const res = await editRevenueInvoiceAction(editForm.id, {
      invoice_date: editForm.invoice_date,
      expected_payment_date: editForm.expected_payment_date,
      service_type: editForm.service_type,
      return_type: editForm.return_type || null,
      description: editForm.description || null,
      total_amount: amount,
      notes: editForm.notes || null
    });

    setIsSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Invoice updated successfully.');
      setTimeout(() => setIsEditModalOpen(false), 1000);
    }
  };

  const handleWaiveInvoice = async (invoice: Invoice) => {
    if (!window.confirm(`Are you sure you want to waive the remaining balance of ${fmtAmt(invoice.balance_amount)} for invoice ${invoice.invoice_number}? This cannot be undone.`)) {
      return;
    }
    const res = await waiveRevenueInvoiceAction(invoice.id, invoice.client_id);
    if (res.error) {
      alert(res.error);
    } else {
      alert('Outstanding balance waived successfully.');
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!window.confirm(`⚠️ DANGER: Are you sure you want to delete invoice ${invoice.invoice_number}? This will permanently delete the invoice and all associated payment history. Type 'delete' to confirm.`)) {
      return;
    }
    const verification = window.prompt("Type 'DELETE' to confirm deletion:");
    if (verification !== 'DELETE') {
      alert('Delete cancelled.');
      return;
    }

    const res = await deleteRevenueInvoiceAction(invoice.id, invoice.client_id);
    if (res.error) {
      alert(res.error);
    } else {
      alert('Invoice deleted successfully.');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedFY('');
    setSelectedAY('');
    setSelectedMonth('');
    setSelectedClientId('');
    setSelectedServiceType('');
    setSelectedReturnType('');
    setSelectedStatus('');
    setSelectedPaymentMethod('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'dashboard' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4" />
            <span>Revenue Dashboard</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'analytics' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Reports & Analytics</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'kpis' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Practice KPIs</span>
          </div>
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Main Dashboard Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Total Billed */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Billed</span>
                <IndianRupee className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-xl font-black text-white mt-3">{fmtAmt(totalBilled)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Billed amount raised</div>
            </div>

            {/* Total Received */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Received</span>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white mt-3 text-emerald-400">{fmtAmt(totalReceived)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Collected in hand</div>
            </div>

            {/* Pending Amount */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Dues</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xl font-black text-white mt-3 text-amber-400">{fmtAmt(pendingAmount)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Outstanding balance</div>
            </div>

            {/* Overdue Amount */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Overdue Dues</span>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-xl font-black text-white mt-3 text-red-400">{fmtAmt(overdueAmount)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Crossed 30-day term</div>
            </div>

            {/* Collection Rate */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Collection Rate</span>
                <TrendingUp className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl font-black text-white mt-3">{fmtPercent(collectionRate)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Received / Billed ratio</div>
            </div>

            {/* Current Month Revenue */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Month Revenue</span>
                <Calendar className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-xl font-black text-white mt-3">{fmtAmt(currentMonthRevenue)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Collected this month</div>
            </div>

            {/* Current Financial Year Revenue */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">FY Revenue</span>
                <Coins className="h-4 w-4 text-teal-400" />
              </div>
              <p className="text-xl font-black text-white mt-3">{fmtAmt(currentFYRevenue)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Collected this FY</div>
            </div>

            {/* Average Fee Per Return */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Fee / Return</span>
                <Tag className="h-4 w-4 text-pink-400" />
              </div>
              <p className="text-xl font-black text-white mt-3">{fmtAmt(avgFeePerReturn)}</p>
              <div className="mt-2 text-[10px] text-slate-500">Billed / Invoices raised</div>
            </div>

            {/* Top Pending Client */}
            <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group col-span-1 md:col-span-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Top Pending Client</span>
                <User className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-sm font-black text-slate-200 mt-3 truncate">{topPendingClient}</p>
              <div className="mt-2 text-[10px] text-slate-500">Client with highest outstanding balance</div>
            </div>
          </div>

          {/* Filtering Section */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm">
                <Filter className="h-4 w-4" />
                <span>Filters & Search</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-500/30 px-3 py-1.5 rounded-xl hover:bg-blue-500/10 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Financial Year */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fin. Year</label>
                <select
                  value={selectedFY}
                  onChange={e => { setSelectedFY(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All FYs</option>
                  {fyOptions.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                </select>
              </div>

              {/* Assessment Year */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ass. Year</label>
                <select
                  value={selectedAY}
                  onChange={e => { setSelectedAY(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All AYs</option>
                  {ayOptions.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                </select>
              </div>

              {/* Month */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Month</label>
                <select
                  value={selectedMonth}
                  onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Months</option>
                  {monthOptions.map(m => {
                    const [yr, mn] = m.split('-');
                    const date = new Date(Number(yr), Number(mn) - 1, 1);
                    const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                    return <option key={m} value={m}>{label}</option>;
                  })}
                </select>
              </div>

              {/* Client */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client</label>
                <select
                  value={selectedClientId}
                  onChange={e => { setSelectedClientId(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Clients</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Service Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Service Type</label>
                <select
                  value={selectedServiceType}
                  onChange={e => { setSelectedServiceType(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Services</option>
                  {SERVICE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Return Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Return Type</label>
                <select
                  value={selectedReturnType}
                  onChange={e => { setSelectedReturnType(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Original">Original</option>
                  <option value="Revised">Revised</option>
                  <option value="Defective">Defective</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Payment Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Not Billed">Not Billed</option>
                  <option value="Invoice Raised">Invoice Raised</option>
                  <option value="Part Paid">Part Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Waived">Waived</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Method</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={e => { setSelectedPaymentMethod(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by client name, PAN, or invoice number..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Invoices List / Table */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="font-bold text-white text-base">Billing & Invoices</h3>
                <p className="text-slate-400 text-xs mt-0.5">Showing {filteredInvoices.length} general practice invoices</p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Invoice</span>
              </button>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold text-sm">No invoices found</p>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">Try resetting filters or click "Create Invoice" to add a new billing entry.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-400 font-semibold bg-slate-900/20">
                      <th className="py-3.5 px-6">S.No</th>
                      <th className="py-3.5 px-4">Client Name & PAN</th>
                      <th className="py-3.5 px-4">Invoice Number</th>
                      <th className="py-3.5 px-4">Service Details</th>
                      <th className="py-3.5 px-4 text-right">Fee Charged</th>
                      <th className="py-3.5 px-4 text-right">Received</th>
                      <th className="py-3.5 px-4 text-right">Balance Due</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {paginatedInvoices.map((inv, index) => {
                      const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      
                      let statusBadge = '';
                      if (inv.status === 'Paid') {
                        statusBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      } else if (inv.status === 'Part Paid') {
                        statusBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                      } else if (inv.status === 'Overdue') {
                        statusBadge = 'bg-red-500/10 text-red-400 border border-red-500/20';
                      } else if (inv.status === 'Waived') {
                        statusBadge = 'bg-slate-800 text-slate-400 border border-slate-700';
                      } else if (inv.status === 'Not Billed') {
                        statusBadge = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                      } else {
                        statusBadge = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                      }

                      return (
                        <tr key={inv.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-3.5 px-6 font-medium text-slate-400">{absoluteIndex}</td>
                          <td className="py-3.5 px-4 font-semibold">
                            <div>{inv.clients?.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">{inv.clients?.pan}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{inv.invoice_number}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">{inv.service_type}</div>
                            {inv.return_type && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {inv.return_type} ({inv.financial_year})
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-slate-200">{fmtAmt(inv.total_amount)}</td>
                          <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">{fmtAmt(inv.amount_received)}</td>
                          <td className="py-3.5 px-4 text-right font-semibold text-amber-400">{fmtAmt(inv.balance_amount)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right space-x-1.5">
                            {/* Actions menu */}
                            <a
                              href={`/revenue/print/${inv.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors hover:bg-slate-700"
                              title="Print Invoice"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </a>

                            {inv.balance_amount > 0 && inv.status !== 'Waived' && (
                              <>
                                <button
                                  onClick={() => handleOpenPaymentModal(inv)}
                                  className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-semibold cursor-pointer border border-emerald-500/20"
                                  title="Record Payment"
                                >
                                  Pay
                                </button>
                                <button
                                  onClick={() => handleWaiveInvoice(inv)}
                                  className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px] cursor-pointer"
                                  title="Waive remaining dues"
                                >
                                  Waive
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleOpenEditModal(inv)}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors hover:bg-slate-700 cursor-pointer"
                              title="Edit Invoice Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteInvoice(inv)}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer border border-red-500/10"
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-[11px]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <span className="text-slate-400 text-xs">
                  Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-[11px]"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Billing & Collections Trend */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span>Monthly Dues & Receipts</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Last 6 calendar months trend</p>

            <div className="flex h-48 items-end justify-between gap-4 pt-6">
              {last6MonthsData.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-end justify-center gap-1 w-full h-32 relative">
                    {/* Billed */}
                    <div 
                      style={{ height: `${(d.billed / maxChartVal) * 100}%` }} 
                      className="w-3.5 bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-400 group relative"
                    >
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap z-20 shadow">
                        Billed: {fmtAmt(d.billed)}
                      </span>
                    </div>
                    {/* Received */}
                    <div 
                      style={{ height: `${(d.received / maxChartVal) * 100}%` }} 
                      className="w-3.5 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:bg-emerald-400 group relative"
                    >
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap z-20 shadow">
                        Received: {fmtAmt(d.received)}
                      </span>
                    </div>
                    {/* Pending */}
                    <div 
                      style={{ height: `${(d.pending / maxChartVal) * 100}%` }} 
                      className="w-3.5 bg-amber-500 rounded-t-sm transition-all duration-500 hover:bg-amber-400 group relative"
                    >
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap z-20 shadow">
                        Pending: {fmtAmt(d.pending)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                <span>Billed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                <span>Received</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                <span>Pending</span>
              </div>
            </div>
          </div>

          {/* Paid vs Unpaid Invoices Summary */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Paid vs Unpaid Summary</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Percentage breakdown of billing collections</p>

            {/* Visual Segments */}
            {statusCounts.total > 1 || filteredInvoices.length > 0 ? (
              <div className="space-y-6 pt-4">
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                  <div style={{ width: `${statusCounts.paidPct}%` }} className="bg-emerald-500 h-full" title={`Paid: ${statusCounts.Paid}`} />
                  <div style={{ width: `${statusCounts.partPaidPct}%` }} className="bg-blue-500 h-full" title={`Part Paid: ${statusCounts.PartPaid}`} />
                  <div style={{ width: `${statusCounts.overduePct}%` }} className="bg-red-500 h-full" title={`Overdue: ${statusCounts.Overdue}`} />
                  <div style={{ width: `${statusCounts.waivedPct}%` }} className="bg-slate-600 h-full" title={`Waived: ${statusCounts.Waived}`} />
                  <div style={{ width: `${statusCounts.unpaidPct}%` }} className="bg-purple-500 h-full" title={`Unpaid: ${statusCounts.Unpaid}`} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs pt-4">
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span>Paid</span>
                    </div>
                    <p className="text-white font-bold mt-1 text-sm">{statusCounts.Paid} invoices ({statusCounts.paidPct.toFixed(0)}%)</p>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Part Paid</span>
                    </div>
                    <p className="text-white font-bold mt-1 text-sm">{statusCounts.PartPaid} invoices ({statusCounts.partPaidPct.toFixed(0)}%)</p>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Overdue</span>
                    </div>
                    <p className="text-white font-bold mt-1 text-sm">{statusCounts.Overdue} invoices ({statusCounts.overduePct.toFixed(0)}%)</p>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      <span>Waived</span>
                    </div>
                    <p className="text-white font-bold mt-1 text-sm">{statusCounts.Waived} invoices ({statusCounts.waivedPct.toFixed(0)}%)</p>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Raised</span>
                    </div>
                    <p className="text-white font-bold mt-1 text-sm">{statusCounts.Unpaid} invoices ({statusCounts.unpaidPct.toFixed(0)}%)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">No billing records found.</div>
            )}
          </div>

          {/* Service breakdown chart */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Tag className="h-4 w-4 text-blue-400" />
              <span>Service-wise Revenue</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Revenue contributions by practice service categories</p>

            {serviceBreakdown.length > 0 ? (
              <div className="space-y-4">
                {serviceBreakdown.slice(0, 5).map((s, idx) => {
                  const maxAmt = serviceBreakdown[0]?.amount || 1;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">{s.service}</span>
                        <span className="text-slate-400 font-medium">{fmtAmt(s.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
                        <div 
                          style={{ width: `${(s.amount / maxAmt) * 100}%` }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">No billing records found.</div>
            )}
          </div>

          {/* Return Type breakdown chart */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center space-x-2">
              <FileText className="h-4 w-4 text-teal-400" />
              <span>Return Type Revenue</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Revenue contributions by filing return types</p>

            {returnTypeBreakdown.length > 0 ? (
              <div className="space-y-4">
                {returnTypeBreakdown.slice(0, 5).map((r, idx) => {
                  const maxAmt = returnTypeBreakdown[0]?.amount || 1;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">{r.rt}</span>
                        <span className="text-slate-400 font-medium">{fmtAmt(r.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
                        <div 
                          style={{ width: `${(r.amount / maxAmt) * 100}%` }}
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">No billing records found.</div>
            )}
          </div>

          {/* Top 10 Clients by Revenue / Pending Dues */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-6 col-span-1 lg:col-span-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center space-x-2">
              <User className="h-4 w-4 text-orange-400" />
              <span>Top Clients by Collections & Outstanding</span>
            </h3>

            {top10RevenueClients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-slate-400 font-semibold bg-slate-900/20">
                      <th className="py-2.5 px-4">Client Name</th>
                      <th className="py-2.5 px-4">PAN</th>
                      <th className="py-2.5 px-4 text-right">Total Billed</th>
                      <th className="py-2.5 px-4 text-right font-bold text-amber-500">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {top10RevenueClients.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="py-3 px-4 font-semibold text-slate-200">{c.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 tracking-wider uppercase">{c.pan}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-300">{fmtAmt(c.billed)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-400">{fmtAmt(c.pending)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">No billing records found.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Total Clients */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Clients Enrolled</span>
            <p className="text-2xl font-black text-white mt-2">{clients.length}</p>
            <div className="mt-3 text-[10px] text-slate-500">Total client database volume</div>
          </div>

          {/* Returns Filed */}
          <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Returns Filed</span>
            <p className="text-2xl font-black text-emerald-400 mt-2">{returnsFiled}</p>
            <div className="mt-3 text-[10px] text-slate-500">Queue items marked completed</div>
          </div>

          {/* Returns Pending */}
          <div className="bg-slate-900/40 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Returns Pending</span>
            <p className="text-2xl font-black text-amber-400 mt-2">{returnsPending}</p>
            <div className="mt-3 text-[10px] text-slate-500">Workload backlog awaiting filing</div>
          </div>

          {/* Clients Billed */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Clients Billed</span>
            <p className="text-2xl font-black text-white mt-2">{clientsBilledCount}</p>
            <div className="mt-3 text-[10px] text-slate-500">Unique client accounts billed</div>
          </div>

          {/* Clients Paid */}
          <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Clients Fully Paid</span>
            <p className="text-2xl font-black text-emerald-400 mt-2">{clientsPaidCount}</p>
            <div className="mt-3 text-[10px] text-slate-500">Clients with zero pending dues</div>
          </div>

          {/* Clients Pending Payment */}
          <div className="bg-slate-900/40 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Clients Pending Dues</span>
            <p className="text-2xl font-black text-amber-400 mt-2">{clientsPendingPaymentCount}</p>
            <div className="mt-3 text-[10px] text-slate-500">Accounts with outstanding bills</div>
          </div>

          {/* Average Fee Per Client */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Fee Per Client</span>
            <p className="text-2xl font-black text-white mt-2">{fmtAmt(avgFeePerClient)}</p>
            <div className="mt-3 text-[10px] text-slate-500">Total Billed / Unique Billed Clients</div>
          </div>

          {/* Average Fee Per Return */}
          <div className="sdds-blue-card border border-blue-800/40 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Fee Per Return</span>
            <p className="text-2xl font-black text-white mt-2">{fmtAmt(avgFeePerReturn)}</p>
            <div className="mt-3 text-[10px] text-slate-500">Total Billed / Total Invoices</div>
          </div>

          {/* Clients Filed This FY */}
          <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Clients Filed This FY</span>
            <p className="text-2xl font-black text-emerald-400 mt-2">{clientsFiledThisFY}</p>
            <div className="mt-3 text-[10px] text-slate-500">Completed returns in selected FY ({selectedAY || currentAYEquivalent})</div>
          </div>

          {/* Clients Not Filed This FY */}
          <div className="bg-slate-900/40 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Clients Not Filed This FY</span>
            <p className="text-2xl font-black text-amber-400 mt-2">{clientsNotFiledThisFY}</p>
            <div className="mt-3 text-[10px] text-slate-500">Backlog clients without filed status in current FY</div>
          </div>
        </div>
      )}

      {/* --- CREATE INVOICE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Generate Revenue Invoice</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-semibold">{errorMsg}</div>}
              {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-semibold">{successMsg}</div>}

              {/* Client Select */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Select Client</label>
                <select
                  value={invoiceForm.client_id}
                  onChange={e => setInvoiceForm(prev => ({ ...prev, client_id: e.target.value, filing_id: '' }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="" disabled>-- Choose Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.pan})</option>)}
                </select>
              </div>

              {/* Optional Filing Link */}
              {invoiceForm.client_id && clientFilings.length > 0 && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Link to filing record (Optional)</label>
                  <select
                    value={invoiceForm.filing_id}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, filing_id: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- No link (Standalone Invoice) --</option>
                    {clientFilings.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.assessment_year} - {f.itr_type || 'ITR'} ({f.filing_status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Service Type */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Service Category</label>
                  <select
                    value={invoiceForm.service_type}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, service_type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {SERVICE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Return Type (only if service type starts with ITR) */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Return Type</label>
                  <select
                    value={invoiceForm.return_type}
                    disabled={!invoiceForm.service_type.startsWith('ITR')}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, return_type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                  >
                    <option value="Original">Original</option>
                    <option value="Revised">Revised</option>
                    <option value="Defective">Defective</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fee Amount */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Fee Charged (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter fee amount"
                    value={invoiceForm.total_amount}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, total_amount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-semibold"
                    required
                  />
                </div>

                {/* Invoice Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceForm.invoice_date}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, invoice_date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Service Description</label>
                <textarea
                  placeholder="Details of services rendered..."
                  rows={2}
                  value={invoiceForm.description}
                  onChange={e => setInvoiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Internal Notes</label>
                <textarea
                  placeholder="Private notes (payment instructions, follow ups etc.)"
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={e => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {isSubmitting ? 'Generating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECORD PAYMENT MODAL --- */}
      {isPaymentModalOpen && activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Record Payment</h3>
                <p className="text-slate-400 text-[10px] mt-0.5 font-mono">Invoice: {activeInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-semibold">{errorMsg}</div>}
              {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-semibold">{successMsg}</div>}

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Remaining Balance</span>
                  <p className="text-base font-bold text-white mt-0.5">{fmtAmt(activeInvoice.balance_amount)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Invoice</span>
                  <p className="text-base font-bold text-slate-300 mt-0.5">{fmtAmt(activeInvoice.total_amount)}</p>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={activeInvoice.balance_amount}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={e => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Payment Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={e => setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Reference ID */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Reference Number (UPI Ref, Check No etc.)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Transaction ID or Txn ID"
                  value={paymentForm.reference_number}
                  onChange={e => setPaymentForm(prev => ({ ...prev, reference_number: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Private Notes */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Payment Notes</label>
                <textarea
                  placeholder="Additional notes about this installment..."
                  rows={2}
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {isSubmitting ? 'Recording...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT INVOICE MODAL --- */}
      {isEditModalOpen && activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Edit Invoice Details</h3>
                <p className="text-slate-400 text-[10px] mt-0.5 font-mono">Invoice: {activeInvoice.invoice_number} ({activeInvoice.clients?.name})</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditInvoice} className="p-6 space-y-4 text-xs">
              {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-semibold">{errorMsg}</div>}
              {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-semibold">{successMsg}</div>}

              <div className="grid grid-cols-2 gap-4">
                {/* Service Type */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Service Category</label>
                  <select
                    value={editForm.service_type}
                    onChange={e => setEditForm(prev => ({ ...prev, service_type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {SERVICE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Return Type */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Return Type</label>
                  <select
                    value={editForm.return_type}
                    disabled={!editForm.service_type.startsWith('ITR')}
                    onChange={e => setEditForm(prev => ({ ...prev, return_type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                  >
                    <option value="Original">Original</option>
                    <option value="Revised">Revised</option>
                    <option value="Defective">Defective</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Invoice Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Invoice Date</label>
                  <input
                    type="date"
                    value={editForm.invoice_date}
                    onChange={e => setEditForm(prev => ({ ...prev, invoice_date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Expected Payment Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Due Date (30 Days Default)</label>
                  <input
                    type="date"
                    value={editForm.expected_payment_date}
                    onChange={e => setEditForm(prev => ({ ...prev, expected_payment_date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Fee Charged (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.total_amount}
                  onChange={e => setEditForm(prev => ({ ...prev, total_amount: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-bold"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Service Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
