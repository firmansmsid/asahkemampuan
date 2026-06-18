'use client';

import { useEffect, useState } from 'react';
import { Clock, ChevronRight, Trophy } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { HasilTryout } from '@/types';
import { formatDateTime, formatDuration, scoreBg } from '@/lib/utils';
import Link from 'next/link';

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<HasilTryout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRiwayat = async () => {
    try {
      const res = await apiClient.get('/hasil');
      setRiwayat(res.data.data);
    } catch {
      // demo data
      setRiwayat([
        { id: 1, sesi_id: 1, user_id: 1, paket_id: 1, nilai: 82, jumlah_benar: 90, jumlah_salah: 14, jumlah_kosong: 6, durasi_pengerjaan: 5200, lulus: true, rank: 18, created_at: new Date(Date.now() - 86400000).toISOString(), paket: { id: 1, kategori_id: 1, judul: 'SKD CPNS Paket A', slug: '', deskripsi: '', durasi: 100, jumlah_soal: 110, passing_grade: 260, is_gratis: true, status: 'aktif', harga: 0, access_mode: 'publik', created_at: '', updated_at: '' } },
        { id: 2, sesi_id: 2, user_id: 1, paket_id: 2, nilai: 65, jumlah_benar: 58, jumlah_salah: 20, jumlah_kosong: 12, durasi_pengerjaan: 6300, lulus: false, created_at: new Date(Date.now() - 172800000).toISOString(), paket: { id: 2, kategori_id: 2, judul: 'UTBK Saintek 2024', slug: '', deskripsi: '', durasi: 115, jumlah_soal: 90, passing_grade: 500, is_gratis: false, status: 'aktif', harga: 50000, access_mode: 'publik', created_at: '', updated_at: '' } },
        { id: 3, sesi_id: 3, user_id: 1, paket_id: 3, nilai: 91, jumlah_benar: 100, jumlah_salah: 8, jumlah_kosong: 2, durasi_pengerjaan: 4800, lulus: true, rank: 5, created_at: new Date(Date.now() - 259200000).toISOString(), paket: { id: 3, kategori_id: 1, judul: 'SKD CPNS Paket B', slug: '', deskripsi: '', durasi: 100, jumlah_soal: 110, passing_grade: 260, is_gratis: true, status: 'aktif', harga: 0, access_mode: 'publik', created_at: '', updated_at: '' } },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  return (
    <DashboardLayout title="Riwayat Ujian">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Riwayat Tryout</h2>
        <p className="text-slate-500 text-sm">Semua sesi ujian yang telah kamu selesaikan</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" label="Memuat riwayat..." />
        </div>
      ) : riwayat.length === 0 ? (
        <div className="card text-center py-16">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">Belum ada riwayat tryout</p>
          <p className="text-sm text-slate-400 mt-1">Mulai tryout pertamamu sekarang!</p>
          <Link href="/dashboard/tryout" className="btn-md btn-primary inline-flex mt-4">Mulai Tryout</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {riwayat.map((h, i) => (
            <Link
              key={h.id}
              href={`/dashboard/hasil/${h.id}`}
              className="card-hover flex items-center gap-4 animate-fade-in group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Score circle */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${scoreBg(h.nilai)}`}>
                {h.nilai}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                    {h.paket?.judul || 'Tryout'}
                  </p>
                  {h.lulus
                    ? <span className="badge badge-green text-xs flex-shrink-0">Lulus</span>
                    : <span className="badge badge-red text-xs flex-shrink-0">Tidak Lulus</span>
                  }
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>✅ {h.jumlah_benar} Benar</span>
                  <span>❌ {h.jumlah_salah} Salah</span>
                  <span>⏱ {formatDuration(h.durasi_pengerjaan || 0)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(h.created_at)}</p>
              </div>

              {/* Rank & arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {h.rank && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    #{h.rank}
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
