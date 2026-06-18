'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Users, ArrowDownLeft, Clock, CheckCircle,
  XCircle, CreditCard, Percent, RefreshCw
} from 'lucide-react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface FinanceOverview {
  total_revenue: number;
  total_pending: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  net_revenue: number;
  total_transactions: number;
  paid_transactions: number;
}

interface PaymentRecord {
  id: number;
  order_id: string;
  amount: number;
  status: string;
  payment_type: string | null;
  paid_at: string | null;
  created_at: string;
  user: { id: number; name: string; email: string };
  paket: { id: number; judul: string };
}

interface CommissionRecord {
  id: number;
  payment_amount: number;
  commission_pct: string;
  commission_amount: number;
  status: string;
  created_at: string;
  referrer: { id: number; name: string; email: string; referral_code: string };
  referred: { id: number; name: string; email: string };
  payment: { id: number; order_id: string; amount: number; status: string };
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminFinancePage() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'commissions'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, payRes, comRes] = await Promise.all([
        apiClient.get('/admin/finance/overview'),
        apiClient.get('/admin/finance/payments?per_page=50'),
        apiClient.get('/admin/finance/commissions?per_page=50'),
      ]);
      setOverview(ovRes.data.data);
      setPayments(payRes.data.data || []);
      setCommissions(comRes.data.data || []);
    } catch {
      toast.error('Gagal memuat data keuangan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateCommissionStatus = async (id: number, status: string) => {
    try {
      await apiClient.put(`/admin/finance/commissions/${id}`, { status });
      toast.success('Status komisi diperbarui');
      fetchData();
    } catch {
      toast.error('Gagal update status');
    }
  };

  if (isLoading || !overview) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-3" />
          <p className="text-slate-500">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Manajemen Keuangan">
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">💰 Manajemen Keuangan</h1>
          <p className="text-slate-500 text-sm mt-1">Pembayaran, komisi referral, dan revenue</p>
        </div>
        <button onClick={fetchData} className="btn-sm bg-slate-100 text-slate-600 hover:bg-slate-200">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatRupiah(overview.total_revenue), icon: DollarSign, color: 'bg-emerald-500', sub: `${overview.paid_transactions} transaksi sukses` },
          { label: 'Pending', value: formatRupiah(overview.total_pending), icon: Clock, color: 'bg-amber-500', sub: 'Menunggu pembayaran' },
          { label: 'Total Komisi', value: formatRupiah(overview.total_commissions), icon: ArrowDownLeft, color: 'bg-purple-500', sub: `Pending: ${formatRupiah(overview.pending_commissions)}` },
          { label: 'Net Revenue', value: formatRupiah(overview.net_revenue), icon: TrendingUp, color: 'bg-blue-500', sub: 'Revenue - Komisi' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase">{s.label}</p>
            </div>
            <p className="text-lg font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
        {[
          { key: 'overview' as const, label: 'Ringkasan', icon: TrendingUp },
          { key: 'payments' as const, label: `Pembayaran (${payments.length})`, icon: CreditCard },
          { key: 'commissions' as const, label: `Komisi (${commissions.length})`, icon: Percent },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" /> Pembayaran Terakhir</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {payments.slice(0, 10).map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.user?.name}</p>
                    <p className="text-xs text-slate-400">{p.paket?.judul} · {p.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{formatRupiah(p.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-slate-100 text-slate-600'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Belum ada pembayaran</p>}
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Percent className="w-4 h-4 text-purple-500" /> Komisi Terakhir</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {commissions.slice(0, 10).map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.referrer?.name} <span className="text-slate-400">→</span> {c.referred?.name}</p>
                    <p className="text-xs text-slate-400">{c.commission_pct}% dari {formatRupiah(c.payment_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{formatRupiah(c.commission_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] || 'bg-slate-100'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
              {commissions.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Belum ada komisi</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="text-left p-4">Order ID</th>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Paket</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Metode</th>
                  <th className="text-right p-4">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-sm font-mono text-slate-700">{p.order_id}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-800">{p.user?.name}</p>
                      <p className="text-xs text-slate-400">{p.user?.email}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{p.paket?.judul}</td>
                    <td className="p-4 text-sm font-bold text-right text-slate-800">{formatRupiah(p.amount)}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[p.status] || 'bg-slate-100'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs text-slate-500">{p.payment_type || '-'}</td>
                    <td className="p-4 text-right text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && <p className="p-8 text-center text-slate-400">Belum ada data pembayaran</p>}
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="text-left p-4">Referrer</th>
                  <th className="text-left p-4">Referred</th>
                  <th className="text-right p-4">Pembayaran</th>
                  <th className="text-center p-4">%</th>
                  <th className="text-right p-4">Komisi</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-800">{c.referrer?.name}</p>
                      <p className="text-xs text-slate-400">Code: {c.referrer?.referral_code}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-700">{c.referred?.name}</p>
                      <p className="text-xs text-slate-400">{c.referred?.email}</p>
                    </td>
                    <td className="p-4 text-sm text-right text-slate-600">{formatRupiah(c.payment_amount)}</td>
                    <td className="p-4 text-center text-sm font-semibold text-purple-600">{c.commission_pct}%</td>
                    <td className="p-4 text-right text-sm font-bold text-emerald-600">{formatRupiah(c.commission_amount)}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[c.status] || 'bg-slate-100'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {c.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => updateCommissionStatus(c.id, 'paid')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Bayar">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateCommissionStatus(c.id, 'cancelled')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Batal">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {commissions.length === 0 && <p className="p-8 text-center text-slate-400">Belum ada data komisi</p>}
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
