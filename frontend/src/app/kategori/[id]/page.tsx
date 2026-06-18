'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Tag } from 'lucide-react';
import apiClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function KategoriDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [kategori, setKategori] = useState<any>(null);
  const [paketList, setPaketList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCat, resPaket] = await Promise.all([
          apiClient.get(`/kategori/${id}`),
          apiClient.get(`/paket-list?kategori_id=${id}`)
        ]);
        
        if (resCat.data.data) {
          setKategori(resCat.data.data);
        }
        if (resPaket.data.data) {
          setPaketList(resPaket.data.data);
        }
      } catch (err) {
        console.error('Gagal memuat kategori', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="spinner w-8 h-8 border-green-600"></span>
      </div>
    );
  }

  if (!kategori) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Kategori Tidak Ditemukan</h2>
        <Link href="/" className="btn-md bg-green-600 text-white rounded-xl">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/#paket" className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan Kategori
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center text-3xl shadow-sm">
              {kategori.icon || '📚'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{kategori.nama}</h1>
              <p className="text-slate-500">{kategori.deskripsi || 'Kumpulan paket tryout terbaik untuk persiapan ujianmu.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Package List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Paket Tersedia ({paketList.length})</h2>
        </div>
        
        {paketList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Paket</h3>
            <p className="text-slate-500">Saat ini belum ada paket tryout yang aktif di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paketList.map((paket) => (
              <div key={paket.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight">{paket.judul}</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                      {paket.is_gratis ? 'GRATIS' : 'PREMIUM'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      <span>{kategori.nama}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-bold text-slate-800">
                    {paket.is_gratis ? 'Rp 0' : `Rp ${numberFormat(paket.harga)}`}
                  </div>
                  <button 
                    onClick={() => router.push(isAuthenticated ? '/dashboard/tryout' : '/register')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    Ikuti Tryout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function numberFormat(val: number) {
  return new Intl.NumberFormat('id-ID').format(val);
}
