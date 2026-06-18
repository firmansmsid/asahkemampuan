'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, FileText, Target, Users, AlertCircle, Play, ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { PaketTryout } from '@/types';
import { useUjianStore } from '@/store/ujianStore';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TryoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [paket, setPaket] = useState<(PaketTryout & { has_access?: boolean }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { startUjian } = useUjianStore();
  const router = useRouter();

  const fetchPaket = async () => {
    try {
      const res = await apiClient.get(`/paket/${id}`);
      setPaket(res.data.data);
    } catch {
      toast.error('Paket tidak ditemukan');
      router.push('/dashboard/tryout');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaket();
  }, [id]);

  const handleStart = async () => {
    if (!confirmed) return toast.error('Centang persetujuan terlebih dahulu');
    setIsStarting(true);
    try {
      const sesi = await startUjian(parseInt(id));
      router.push(`/ujian/${sesi.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Paket">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" label="Memuat detail paket..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!paket) return null;

  const hasAccess = paket.has_access !== false;

  const rules = [
    'Timer akan berjalan otomatis setelah klik "Mulai Ujian"',
    'Jawaban tersimpan otomatis setiap kamu memilih opsi',
    'Kamu bisa navigasi soal menggunakan panel navigasi',
    `Ujian otomatis disubmit jika waktu (${paket.durasi} menit) habis`,
    'Pastikan koneksi internet stabil selama ujian',
    'Dilarang membuka tab lain selama ujian berlangsung',
  ];

  return (
    <DashboardLayout title="Detail Paket Tryout">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/tryout" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </Link>

        {/* Header card */}
        <div className={`rounded-2xl p-6 mb-6 text-white relative overflow-hidden ${
          hasAccess
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
            : 'bg-gradient-to-br from-slate-500 to-slate-600'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full border border-white/20 inline-block">
                {paket.kategori?.nama || 'Tryout'}
              </span>
              {!hasAccess && (
                <span className="text-xs font-semibold bg-red-500/80 px-3 py-1 rounded-full border border-red-400/30 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Akses Terbatas
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">{paket.judul}</h1>
            <p className={`text-sm leading-relaxed ${hasAccess ? 'text-blue-100' : 'text-slate-300'}`}>{paket.deskripsi}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: FileText, label: 'Jumlah Soal', value: `${paket.jumlah_soal} soal`, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
            { icon: Clock, label: 'Durasi', value: `${paket.durasi} menit`, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
            { icon: Target, label: 'Passing Grade', value: `${paket.passing_grade}`, bg: 'bg-green-50', iconColor: 'text-green-600' },
            { icon: Users, label: 'Peserta', value: `${paket.peserta_count ?? 0}`, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
          ].map((s, i) => (
            <div key={i} className={`card p-4 text-center ${s.bg}`}>
              <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.iconColor}`} />
              <p className="font-bold text-slate-800 text-sm">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {hasAccess ? (
          <>
            {/* Rules */}
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800">Peraturan Ujian</h3>
              </div>
              <ul className="space-y-2.5">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Confirm & Start */}
            <div className="card border-2 border-blue-100">
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-blue-600"
                />
                <span className="text-sm text-slate-700">
                  Saya memahami dan menyetujui semua peraturan ujian di atas serta siap memulai.
                </span>
              </label>

              <button
                onClick={handleStart}
                disabled={!confirmed || isStarting}
                className="btn-lg btn-primary w-full"
              >
                {isStarting ? (
                  <><span className="spinner w-5 h-5" />Memulai ujian...</>
                ) : (
                  <><Play className="w-5 h-5" />Mulai Ujian Sekarang</>
                )}
              </button>
            </div>
          </>
        ) : (
          /* ====== BLOCKED STATE ====== */
          <div className="card border-2 border-dashed border-red-200 bg-red-50/30">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Akses Tidak Tersedia</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                Kamu belum memiliki akses untuk mengerjakan paket tryout ini.
                Hubungi admin untuk mendapatkan akses.
              </p>
              <div className="bg-white rounded-xl p-4 max-w-xs mx-auto border border-slate-100">
                <p className="text-xs text-slate-500 mb-2 font-medium">Cara mendapatkan akses:</p>
                <ol className="text-xs text-slate-500 space-y-1 text-left">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    Hubungi admin sistem
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    Minta akses ke paket ini
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    Setelah disetujui, refresh halaman
                  </li>
                </ol>
              </div>
              <Link href="/dashboard" className="btn-md btn-secondary mt-5 inline-flex">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
