'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Lock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PaketCard from '@/components/tryout/PaketCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { Kategori, PaketTryout } from '@/types';

export default function TryoutPage() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [paketList, setPaketList] = useState<PaketTryout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKategori, setActiveKategori] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { status: 'aktif' };
      if (activeKategori) params.kategori_id = activeKategori;
      if (search) params.search = search;

      const [katRes, paketRes] = await Promise.all([
        apiClient.get('/kategori'),
        apiClient.get('/paket', { params }),
      ]);
      setKategoriList(katRes.data.data);
      setPaketList(paketRes.data.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeKategori, search]);

  return (
    <DashboardLayout title="Kategori Tryout">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Pilih Paket Tryout</h2>
        <p className="text-slate-500 text-sm">Pilih kategori dan paket tryout sesuai target ujianmu</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari paket tryout..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 font-medium">Kategori:</span>
        </div>
      </div>

      {/* Kategori filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        <button
          onClick={() => setActiveKategori(null)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            !activeKategori ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
          }`}
        >
          Semua ({paketList.length})
        </button>
        {kategoriList.map((kat) => {
          const count = paketList.filter(p => p.kategori_id === kat.id).length;
          return (
            <button
              key={kat.id}
              onClick={() => setActiveKategori(kat.id === activeKategori ? null : kat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeKategori === kat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {kat.nama}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" label="Memuat paket tryout..." />
        </div>
      ) : paketList.length === 0 ? (
        <div className="text-center py-20 card">
          {activeKategori || search ? (
            <>
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">Tidak ada paket ditemukan</p>
              <p className="text-sm text-slate-400 mt-1">Coba ubah filter pencarian Anda</p>
            </>
          ) : (
            <>
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">Belum ada paket tersedia</p>
              <p className="text-sm text-slate-400 mt-1">Hubungi admin untuk mendapatkan akses paket tryout</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paketList.map((paket, i) => (
            <div key={paket.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <PaketCard paket={paket} />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
