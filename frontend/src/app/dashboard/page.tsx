'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Trophy, Clock, Target, ArrowRight, TrendingUp, Play, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/axios';
import { HasilTryout, PaketTryout } from '@/types';
import { formatDateTime, scoreBg } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardStats {
  total_tryout: number;
  rata_rata_nilai: number;
  tryout_lulus: number;
  rank_global?: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [riwayat, setRiwayat] = useState<HasilTryout[]>([]);
  const [allPaket, setAllPaket] = useState<(PaketTryout & { has_access?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, riwayatRes, paketRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/hasil?per_page=5'),
        apiClient.get('/paket?status=aktif'),
      ]);
      setStats(statsRes.data.data);
      setRiwayat(riwayatRes.data.data);
      setAllPaket(paketRes.data.data);
    } catch {
      setStats({ total_tryout: 0, rata_rata_nilai: 0, tryout_lulus: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" label="Memuat dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 11 ? 'Selamat Pagi' : greetingHour < 15 ? 'Selamat Siang' : greetingHour < 19 ? 'Selamat Sore' : 'Selamat Malam';

  const myPaket = allPaket.filter(p => p.has_access !== false);
  const lockedPaket = allPaket.filter(p => p.has_access === false);

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-8" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{greeting},</p>
          <h2 className="text-2xl font-bold text-white mb-1">{user?.name} 👋</h2>
          <p className="text-blue-100 text-sm mb-4">Siap berlatih hari ini? Terus tingkatkan kemampuanmu!</p>
          <Link href="/dashboard/tryout" className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg">
            <Play className="w-4 h-4" />
            Mulai Tryout
          </Link>
        </div>
      </div>

      {/* Account Expiry Warning */}
      {user?.account_expired && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🚫</span>
          <div>
            <h4 className="font-bold text-red-800 text-sm">Akun Anda Telah Kedaluwarsa</h4>
            <p className="text-xs text-red-600 mt-1 leading-relaxed">
              Masa aktif akun Anda sudah berakhir{user.account_expires_at ? ` pada ${new Date(user.account_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}. Anda masih bisa login, tetapi <strong>tidak dapat mengakses materi tryout</strong>. Hubungi admin untuk memperpanjang akun.
            </p>
          </div>
        </div>
      )}
      {!user?.account_expired && user?.days_until_expiry !== null && user?.days_until_expiry !== undefined && user.days_until_expiry <= 30 && (
        <div className={`${user.days_until_expiry <= 7 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'} border rounded-2xl p-4 mb-6 flex items-start gap-3`}>
          <span className="text-2xl flex-shrink-0">⏰</span>
          <div>
            <h4 className={`font-bold text-sm ${user.days_until_expiry <= 7 ? 'text-amber-800' : 'text-blue-800'}`}>
              Masa Aktif Akun Tinggal {user.days_until_expiry} Hari
            </h4>
            <p className={`text-xs mt-1 leading-relaxed ${user.days_until_expiry <= 7 ? 'text-amber-600' : 'text-blue-600'}`}>
              Akun Anda akan berakhir pada {user.account_expires_at ? new Date(user.account_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}. Setelah itu Anda tidak dapat mengakses materi tryout. Hubungi admin untuk perpanjangan.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Tryout" value={stats?.total_tryout ?? 0} icon={BookOpen} iconBg="bg-blue-100" iconColor="text-blue-600" subtitle="Sesi ujian" />
        <StatCard title="Rata-rata Nilai" value={`${stats?.rata_rata_nilai?.toFixed(1) ?? 0}`} icon={TrendingUp} iconBg="bg-purple-100" iconColor="text-purple-600" subtitle="Dari semua tryout" />
        <StatCard title="Tryout Lulus" value={stats?.tryout_lulus ?? 0} icon={Target} iconBg="bg-emerald-100" iconColor="text-emerald-600" subtitle="Di atas passing grade" />
        <StatCard title="Rank Global" value={stats?.rank_global ? `#${stats.rank_global}` : '-'} icon={Trophy} iconBg="bg-amber-100" iconColor="text-amber-600" subtitle="Peringkat kamu" />
      </div>

      {/* =============== PAKET SAYA =============== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-800">Paket Saya</h3>
            <span className="badge badge-green text-xs">{myPaket.length} paket</span>
          </div>
          <Link href="/dashboard/tryout" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {myPaket.length === 0 ? (
          <div className="card text-center py-10">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">Belum ada paket yang bisa kamu akses</p>
            <p className="text-xs text-slate-400 mt-1">Hubungi admin untuk mendapatkan akses tryout</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPaket.map(paket => (
              <Link key={paket.id} href={`/dashboard/tryout/${paket.id}`}
                className="card group hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer border border-transparent">
                <div className="h-1 -mx-6 -mt-6 mb-4 rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-500" />
                <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors truncate">{paket.judul}</h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{paket.deskripsi || paket.kategori?.nama}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>{paket.jumlah_soal} soal</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{paket.durasi}m</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Mulai <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* =============== PAKET LAINNYA =============== */}
      {lockedPaket.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-500">Paket Lainnya</h3>
            <span className="badge badge-gray text-xs">{lockedPaket.length} paket</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedPaket.map(paket => (
              <Link key={paket.id} href={`/dashboard/request-access/${paket.id}`}
                className="card relative overflow-hidden border border-dashed border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                <div className={`h-1 -mx-6 -mt-6 mb-4 rounded-t-2xl transition-all ${
                  !paket.is_gratis && paket.harga > 0
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500'
                    : 'bg-gradient-to-r from-slate-300 to-slate-400 group-hover:from-blue-400 group-hover:to-indigo-400'
                }`} />
                <div className="flex items-start gap-2 mb-1">
                  <h4 className="font-bold text-slate-500 text-sm truncate flex-1 group-hover:text-slate-700 transition-colors">{paket.judul}</h4>
                  {!paket.is_gratis && paket.harga > 0 ? (
                    <span className="badge bg-amber-100 text-amber-700 text-xs flex items-center gap-1 flex-shrink-0">
                      Rp {paket.harga.toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="badge bg-red-100 text-red-500 text-xs flex items-center gap-1 flex-shrink-0">
                      <Lock className="w-3 h-3" />Terkunci
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">{paket.kategori?.nama} · {paket.jumlah_soal} soal · {paket.durasi} menit</p>
                <div className={`rounded-lg p-2.5 text-center transition-colors ${
                  !paket.is_gratis && paket.harga > 0
                    ? 'bg-amber-50 group-hover:bg-amber-100'
                    : 'bg-blue-50 group-hover:bg-blue-100'
                }`}>
                  <p className={`text-xs font-semibold ${
                    !paket.is_gratis && paket.harga > 0
                      ? 'text-amber-700'
                      : 'text-blue-600'
                  }`}>
                    {!paket.is_gratis && paket.harga > 0 ? '💳 Klik untuk beli akses' : '📩 Klik untuk ajukan akses'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* =============== RIWAYAT =============== */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Riwayat Terakhir</h3>
          <Link href="/dashboard/riwayat" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {riwayat.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada riwayat tryout</p>
            <Link href="/dashboard/tryout" className="text-blue-600 text-sm font-medium mt-1 inline-block hover:underline">Mulai sekarang</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {riwayat.slice(0, 5).map((h) => (
              <Link key={h.id} href={`/dashboard/hasil/${h.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{h.paket?.judul || 'Tryout'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(h.created_at)}</p>
                </div>
                <div className="text-right ml-3">
                  <span className={`badge ${scoreBg(h.nilai)}`}>{h.nilai}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{h.lulus ? '✅ Lulus' : '❌ Tidak'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
