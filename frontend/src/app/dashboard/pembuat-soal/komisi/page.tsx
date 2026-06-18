'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Clock, CheckCircle, PenTool, DollarSign } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CommissionData {
  soal_commission_pct: number;
  total_verified_soal: number;
  total_earned: number;
  pending_earned: number;
  paid_earned: number;
  commissions: {
    id: number;
    paket: { id: number; judul: string } | null;
    payment: { id: number; order_id: string; amount: number } | null;
    soal_count: number;
    total_soal_paket: number;
    commission_pct: number;
    commission_amount: number;
    status: string;
    created_at: string;
  }[];
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function PembuatSoalKomisiPage() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/pembuat-soal/komisi');
        setData(res.data.data);
      } catch {
        toast.error('Gagal memuat data komisi');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Komisi Saya">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" label="Memuat komisi..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Komisi Saya">
        <div className="card text-center py-12">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Gagal memuat data komisi</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Komisi Saya">
      <div className="max-w-4xl mx-auto">
        {/* How it works */}
        <div className="card mb-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Komisi Pembuat Soal</h3>
              <p className="text-sm text-violet-100 leading-relaxed">
                Anda mendapatkan <strong>{data.soal_commission_pct}%</strong> komisi dari setiap paket yang terjual, proporsional dengan jumlah soal Anda di paket tersebut. Semakin banyak soal terverifikasi, semakin besar potensi penghasilan Anda!
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Pendapatan', value: formatRupiah(data.total_earned), icon: DollarSign, bg: 'bg-violet-50', color: 'text-violet-600' },
            { label: 'Pending', value: formatRupiah(data.pending_earned), icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
            { label: 'Sudah Dibayar', value: formatRupiah(data.paid_earned), icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { label: 'Soal Verified', value: String(data.total_verified_soal), icon: PenTool, bg: 'bg-blue-50', color: 'text-blue-600' },
          ].map((s, i) => (
            <div key={i} className={`card p-4 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
              <p className="font-bold text-lg text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Commission History */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            Riwayat Komisi
          </h3>

          {data.commissions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Belum ada riwayat komisi</p>
              <p className="text-slate-400 text-xs mt-1">Komisi akan muncul setelah paket yang berisi soal Anda terjual</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.commissions.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    c.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                    c.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  )}>
                    {c.status === 'paid' ? <CheckCircle className="w-5 h-5" /> :
                     c.status === 'cancelled' ? <DollarSign className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {c.paket?.judul || 'Paket Tryout'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.soal_count}/{c.total_soal_paket} soal • {c.commission_pct}% komisi
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-violet-700">{formatRupiah(c.commission_amount)}</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      c.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {c.status === 'paid' ? 'Dibayar' : c.status === 'cancelled' ? 'Batal' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
