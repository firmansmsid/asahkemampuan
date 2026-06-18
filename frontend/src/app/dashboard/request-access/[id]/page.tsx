'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Send, Clock, CheckCircle, XCircle, BookOpen, FileText, Target, CreditCard, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { PaketTryout } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Script from 'next/script';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: Record<string, unknown>) => void;
        onPending?: (result: Record<string, unknown>) => void;
        onError?: (result: Record<string, unknown>) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export default function RequestAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [paket, setPaket] = useState<PaketTryout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pesan, setPesan] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected' | 'sent'>('none');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paketRes, myReqRes] = await Promise.all([
          apiClient.get(`/paket/${id}`),
          apiClient.get('/access-requests/my'),
        ]);
        setPaket(paketRes.data.data);

        const myRequests = myReqRes.data.data;
        const existing = myRequests.find((r: { paket_id: number; status: string }) => r.paket_id === parseInt(id));
        if (existing) {
          setRequestStatus(existing.status);
        }
      } catch {
        toast.error('Gagal memuat data');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleSubmit = async () => {
    setIsSending(true);
    try {
      await apiClient.post('/access-requests', {
        paket_id: parseInt(id),
        pesan: pesan.trim() || null,
      });
      setRequestStatus('sent');
      toast.success('Permintaan akses berhasil dikirim!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setIsSending(false);
    }
  };

  const handlePayment = async () => {
    if (!paket) return;
    setIsPaying(true);
    try {
      const res = await apiClient.post('/payment/create', { paket_id: paket.id });
      const { snap_token } = res.data.data;

      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: () => {
            toast.success('Pembayaran berhasil! Akses paket telah diberikan.');
            router.push(`/dashboard/tryout/${paket.id}`);
          },
          onPending: () => {
            toast.success('Pembayaran menunggu konfirmasi. Cek kembali nanti.');
            router.push('/dashboard');
          },
          onError: () => {
            toast.error('Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: () => {
            setIsPaying(false);
          },
        });
      } else {
        toast.error('Payment system belum siap. Refresh halaman.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <DashboardLayout title="Request Akses">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" label="Memuat..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!paket) return null;

  const isPremium = !paket.is_gratis && paket.harga > 0;

  return (
    <DashboardLayout title="Akses Paket">
      {/* Midtrans Snap JS */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        {/* Paket Info */}
        <div className={`rounded-2xl p-6 mb-6 text-white relative overflow-hidden ${
          isPremium
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-slate-600 to-slate-700'
        }`}>
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">{paket.kategori?.nama || 'Tryout'}</span>
              {isPremium ? (
                <span className="text-xs font-semibold bg-yellow-400/30 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Premium
                </span>
              ) : (
                <span className="text-xs font-semibold bg-red-500/80 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terbatas
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold mb-1">{paket.judul}</h1>
            <p className="text-white/80 text-sm">{paket.deskripsi}</p>
            {isPremium && (
              <p className="text-2xl font-bold mt-3">{formatRupiah(paket.harga)}</p>
            )}
          </div>
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center bg-blue-50">
            <FileText className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <p className="font-bold text-sm text-slate-800">{paket.jumlah_soal}</p>
            <p className="text-xs text-slate-500">Soal</p>
          </div>
          <div className="card p-3 text-center bg-purple-50">
            <Clock className="w-4 h-4 mx-auto text-purple-600 mb-1" />
            <p className="font-bold text-sm text-slate-800">{paket.durasi}m</p>
            <p className="text-xs text-slate-500">Durasi</p>
          </div>
          <div className="card p-3 text-center bg-green-50">
            <Target className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="font-bold text-sm text-slate-800">{paket.passing_grade}</p>
            <p className="text-xs text-slate-500">Min. Nilai</p>
          </div>
        </div>

        {/* Payment / Request Status */}
        {requestStatus === 'sent' || requestStatus === 'pending' ? (
          <div className="card border-2 border-amber-200 bg-amber-50/50 text-center py-8">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Permintaan Sedang Diproses</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Permintaan akses kamu sudah dikirim ke admin. Tunggu persetujuan, lalu refresh halaman.
            </p>
            <Link href="/dashboard" className="btn-md btn-secondary mt-5 inline-flex">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>
        ) : requestStatus === 'approved' ? (
          <div className="card border-2 border-green-200 bg-green-50/50 text-center py-8">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Akses Disetujui! 🎉</h3>
            <p className="text-sm text-slate-500 mb-4">Kamu sudah bisa mengerjakan paket ini.</p>
            <Link href={`/dashboard/tryout/${paket.id}`} className="btn-md btn-primary inline-flex">
              <BookOpen className="w-4 h-4" /> Mulai Tryout
            </Link>
          </div>
        ) : requestStatus === 'rejected' ? (
          <div className="card border-2 border-red-200 bg-red-50/50 text-center py-8">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Permintaan Ditolak</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">
              Admin menolak permintaan akses kamu. Hubungi admin untuk informasi lebih lanjut.
            </p>
            <Link href="/dashboard" className="btn-md btn-secondary inline-flex">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>
        ) : isPremium ? (
          /* Payment Section */
          <div className="card border-2 border-amber-100">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-800">Beli Akses Paket</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Paket ini berbayar. Setelah pembayaran berhasil, akses akan langsung diberikan otomatis.
            </p>

            <div className="bg-amber-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">{paket.judul}</span>
                <span className="font-bold text-slate-800">{formatRupiah(paket.harga)}</span>
              </div>
              <hr className="border-amber-200 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-lg font-bold text-amber-700">{formatRupiah(paket.harga)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3 mb-5 text-xs text-green-700">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Pembayaran aman melalui Midtrans. Mendukung QRIS, GoPay, ShopeePay, Transfer Bank, dan lainnya.</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="btn-lg w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-200/50 flex items-center justify-center gap-2"
            >
              {isPaying ? (
                <><span className="spinner w-5 h-5" />Memproses...</>
              ) : (
                <><CreditCard className="w-5 h-5" />Bayar {formatRupiah(paket.harga)}</>
              )}
            </button>
          </div>
        ) : (
          /* Request Access Section (free/terbatas) */
          <div className="card border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Ajukan Akses</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Paket ini memerlukan persetujuan admin. Kirim permintaan akses dan admin akan meninjaunya.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Pesan untuk Admin <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <textarea
                value={pesan}
                onChange={e => setPesan(e.target.value)}
                placeholder="Contoh: Saya ingin latihan untuk persiapan ujian semester..."
                className="input"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-slate-400 mt-1">{pesan.length}/500</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSending}
              className="btn-lg btn-primary w-full"
            >
              {isSending ? (
                <><span className="spinner w-5 h-5" />Mengirim...</>
              ) : (
                <><Send className="w-5 h-5" />Kirim Permintaan Akses</>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
