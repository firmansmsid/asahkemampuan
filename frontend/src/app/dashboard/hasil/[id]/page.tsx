'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Trophy, Clock, Target, BarChart2,
  RotateCcw, Home, ChevronDown, ChevronUp, BookOpen, AlertCircle, MinusCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { HasilTryout } from '@/types';
import { formatDuration, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PembahasanItem {
  nomor: number;
  soal_id: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  pilihan_e?: string;
  kunci_jawaban: string;
  jawaban_user: string | null;
  is_benar: boolean;
  pembahasan: string | null;
}

export default function HasilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [hasil, setHasil] = useState<HasilTryout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showPembahasan, setShowPembahasan] = useState(false);
  const [pembahasanList, setPembahasanList] = useState<PembahasanItem[]>([]);
  const [isLoadingPembahasan, setIsLoadingPembahasan] = useState(false);
  const [filterPembahasan, setFilterPembahasan] = useState<'all' | 'benar' | 'salah' | 'kosong'>('all');

  const fetchHasil = async () => {
    try {
      const res = await apiClient.get(`/hasil/${id}`);
      setHasil(res.data.data);
    } catch {
      toast.error('Gagal memuat hasil');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPembahasan = async () => {
    if (pembahasanList.length > 0) {
      setShowPembahasan(!showPembahasan);
      return;
    }
    setIsLoadingPembahasan(true);
    try {
      const res = await apiClient.get(`/hasil/${id}/pembahasan`);
      setPembahasanList(res.data.data.pembahasan || []);
      setShowPembahasan(true);
    } catch {
      toast.error('Gagal memuat pembahasan');
    } finally {
      setIsLoadingPembahasan(false);
    }
  };

  useEffect(() => { fetchHasil(); }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout title="Hasil Tryout">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" label="Memuat hasil tryout..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!hasil) return null;

  const totalSoal = (hasil.jumlah_benar || 0) + (hasil.jumlah_salah || 0) + (hasil.jumlah_kosong || 0);

  const filteredPembahasan = pembahasanList.filter(p => {
    if (filterPembahasan === 'benar') return p.is_benar;
    if (filterPembahasan === 'salah') return p.jawaban_user && !p.is_benar;
    if (filterPembahasan === 'kosong') return !p.jawaban_user;
    return true;
  });

  const pilihanLabels = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <DashboardLayout title="Hasil Tryout">
      <div className="max-w-2xl mx-auto">
        {/* Score card */}
        <div className={cn(
          'rounded-3xl p-8 text-center mb-6 relative overflow-hidden',
          hasil.lulus
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-red-500 to-orange-600'
        )}>
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 translate-y-8" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 border border-white/30">
              {hasil.lulus
                ? <CheckCircle className="w-9 h-9 text-white" />
                : <XCircle className="w-9 h-9 text-white" />}
            </div>
            <p className="text-white/80 font-medium mb-1">
              {hasil.lulus ? '🎉 Selamat! Kamu Lulus!' : '💪 Jangan Menyerah!'}
            </p>
            <h2 className="text-5xl font-black text-white mb-1">{hasil.nilai}</h2>
            <p className="text-white/70 text-sm mb-4">Nilai Akhir</p>
            {hasil.rank && (
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/30">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-semibold text-sm">Peringkat #{hasil.rank}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: CheckCircle, label: 'Benar', value: hasil.jumlah_benar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: XCircle, label: 'Salah', value: hasil.jumlah_salah, color: 'text-red-500', bg: 'bg-red-50' },
            { icon: Target, label: 'Kosong', value: hasil.jumlah_kosong, color: 'text-slate-500', bg: 'bg-slate-50' },
            { icon: Clock, label: 'Durasi', value: formatDuration(hasil.durasi_pengerjaan || 0), color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((s, i) => (
            <div key={i} className={`card text-center p-4 ${s.bg}`}>
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Performance bar */}
        <div className="card mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Ringkasan Performa</h3>
          <div className="space-y-3">
            {[
              { label: 'Jawaban Benar', value: hasil.jumlah_benar || 0, total: totalSoal, color: 'bg-emerald-500' },
              { label: 'Jawaban Salah', value: hasil.jumlah_salah || 0, total: totalSoal, color: 'bg-red-400' },
              { label: 'Tidak Dijawab', value: hasil.jumlah_kosong || 0, total: totalSoal, color: 'bg-slate-300' },
            ].map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{bar.label}</span>
                  <span className="font-semibold text-slate-800">{bar.value} soal ({Math.round((bar.value / (totalSoal || 1)) * 100)}%)</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${bar.color}`} style={{ width: `${(bar.value / (totalSoal || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail info */}
        <div className="card mb-6">
          <button onClick={() => setShowDetail(!showDetail)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Detail Informasi</h3>
            </div>
            {showDetail ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showDetail && (
            <div className="mt-4 space-y-3 pt-4 border-t border-slate-100 animate-fade-in">
              {[
                { label: 'Paket Tryout', value: hasil.paket?.judul },
                { label: 'Passing Grade', value: hasil.paket?.passing_grade },
                { label: 'Total Soal', value: `${totalSoal} soal` },
                { label: 'Status', value: hasil.lulus ? '✅ Lulus' : '❌ Tidak Lulus' },
                { label: 'Dikerjakan pada', value: formatDateTime(hasil.created_at) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pembahasan Button */}
        <div className="card mb-6">
          <button onClick={fetchPembahasan} disabled={isLoadingPembahasan} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Pembahasan Soal</h3>
            </div>
            {isLoadingPembahasan ? (
              <span className="spinner w-4 h-4" />
            ) : (
              showPembahasan ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showPembahasan && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
              {/* Filter */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {([
                  { key: 'all' as const, label: 'Semua', count: pembahasanList.length },
                  { key: 'benar' as const, label: '✅ Benar', count: pembahasanList.filter(p => p.is_benar).length },
                  { key: 'salah' as const, label: '❌ Salah', count: pembahasanList.filter(p => p.jawaban_user && !p.is_benar).length },
                  { key: 'kosong' as const, label: '⬜ Kosong', count: pembahasanList.filter(p => !p.jawaban_user).length },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilterPembahasan(f.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      filterPembahasan === f.key
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Soal list */}
              <div className="space-y-4">
                {filteredPembahasan.map(p => (
                  <div key={p.soal_id} className={cn(
                    'rounded-xl border p-4',
                    p.is_benar ? 'bg-emerald-50/50 border-emerald-200' :
                    p.jawaban_user ? 'bg-red-50/50 border-red-200' :
                    'bg-slate-50/50 border-slate-200'
                  )}>
                    {/* Status badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                        p.is_benar ? 'bg-emerald-500 text-white' :
                        p.jawaban_user ? 'bg-red-500 text-white' :
                        'bg-slate-300 text-white'
                      )}>
                        {p.nomor}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">{p.pertanyaan}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {p.is_benar ? (
                            <span className="badge badge-green text-xs"><CheckCircle className="w-3 h-3" /> Benar</span>
                          ) : p.jawaban_user ? (
                            <span className="badge badge-red text-xs"><XCircle className="w-3 h-3" /> Salah</span>
                          ) : (
                            <span className="badge badge-gray text-xs"><MinusCircle className="w-3 h-3" /> Tidak Dijawab</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pilihan */}
                    <div className="space-y-1.5 ml-10">
                      {pilihanLabels.map(label => {
                        const key = `pilihan_${label.toLowerCase()}` as keyof PembahasanItem;
                        const val = p[key] as string;
                        if (!val) return null;
                        const isKunci = p.kunci_jawaban === label;
                        const isUserAnswer = p.jawaban_user === label;
                        return (
                          <div key={label} className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                            isKunci ? 'bg-emerald-100 text-emerald-800 font-medium ring-1 ring-emerald-300' :
                            isUserAnswer && !isKunci ? 'bg-red-100 text-red-700 ring-1 ring-red-300 line-through' :
                            'bg-white/60 text-slate-600'
                          )}>
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              isKunci ? 'bg-emerald-500 text-white' :
                              isUserAnswer ? 'bg-red-400 text-white' :
                              'bg-slate-200 text-slate-500'
                            )}>{label}</span>
                            <span className="flex-1">{val}</span>
                            {isKunci && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                            {isUserAnswer && !isKunci && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Pembahasan text */}
                    {p.pembahasan && (
                      <div className="mt-3 ml-10 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Pembahasan:</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{p.pembahasan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn-md btn-secondary flex-1 justify-center">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link href={`/dashboard/tryout/${hasil.paket_id}`} className="btn-md btn-primary flex-1 justify-center">
            <RotateCcw className="w-4 h-4" /> Coba Lagi
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
