'use client';

import { useState, useEffect } from 'react';
import {
  Link2, Copy, Users, DollarSign, Clock, CheckCircle,
  Share2, TrendingUp
} from 'lucide-react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ReferralDashboard {
  referral_code: string;
  commission_pct: string;
  total_earned: number;
  pending_earned: number;
  paid_earned: number;
  total_referrals: number;
  commissions: Commission[];
  referrals: Referral[];
}

interface Commission {
  id: number;
  payment_amount: number;
  commission_pct: string;
  commission_amount: number;
  status: string;
  created_at: string;
  referred: { id: number; name: string; email: string };
  payment: { id: number; order_id: string; amount: number };
}

interface Referral {
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_approved: boolean;
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusBadge: Record<string, { bg: string; label: string }> = {
  pending: { bg: 'bg-amber-100 text-amber-700', label: '⏳ Pending' },
  paid: { bg: 'bg-emerald-100 text-emerald-700', label: '✅ Dibayar' },
  cancelled: { bg: 'bg-red-100 text-red-600', label: '❌ Dibatal' },
};

export default function ReferralPage() {
  const [data, setData] = useState<ReferralDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/referral/dashboard');
        setData(res.data.data);
      } catch {
        toast.error('Gagal memuat data referral');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyLink = () => {
    if (!data) return;
    const link = `${window.location.origin}/register?ref=${data.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link referral disalin!');
  };

  const copyCode = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.referral_code);
    toast.success('Kode referral disalin!');
  };

  if (isLoading || !data) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-3" />
          <p className="text-slate-500">Memuat data referral...</p>
        </div>
      </div>
    );
  }

  const refLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${data.referral_code}`;

  return (
    <DashboardLayout title="Referral & Komisi">
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🔗 Referral & Komisi</h1>
        <p className="text-slate-500 text-sm mt-1">Undang teman, dapatkan komisi dari setiap pembelian</p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Link Referral Anda</h2>
            <p className="text-blue-200 text-sm">Bagikan link ini untuk mendapat {data.commission_pct}% komisi</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-200 flex-shrink-0" />
            <p className="text-sm font-mono text-blue-100 truncate flex-1">{refLink}</p>
            <button onClick={copyLink} className="flex-shrink-0 bg-white/20 hover:bg-white/30 p-2 rounded-lg transition">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-blue-200">Kode Referral</p>
            <button onClick={copyCode} className="text-lg font-bold font-mono hover:text-blue-200 transition flex items-center gap-1">
              {data.referral_code} <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-blue-200">Komisi Per Transaksi</p>
            <p className="text-lg font-bold">{data.commission_pct}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-blue-200">Total Referral</p>
            <p className="text-lg font-bold">{data.total_referrals} orang</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-400">TOTAL KOMISI</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatRupiah(data.total_earned)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-400">PENDING</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatRupiah(data.pending_earned)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-400">DIBAYAR</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatRupiah(data.paid_earned)}</p>
        </div>
      </div>

      {/* Commission History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Riwayat Komisi
          </h3>
        </div>
        {data.commissions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.commissions.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.referred?.name} <span className="text-slate-400">membayar</span> {formatRupiah(c.payment_amount)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.commission_pct}% komisi · {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{formatRupiah(c.commission_amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[c.status]?.bg || 'bg-slate-100'}`}>
                    {statusBadge[c.status]?.label || c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada komisi</p>
            <p className="text-slate-400 text-xs mt-1">Bagikan link referral Anda untuk mulai mendapatkan komisi</p>
          </div>
        )}
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Daftar Referral ({data.total_referrals})
          </h3>
        </div>
        {data.referrals.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.referrals.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.is_approved ? '✅ Aktif' : '⏳ Pending'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Share2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada referral</p>
            <p className="text-slate-400 text-xs mt-1">Salin link di atas dan bagikan!</p>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
