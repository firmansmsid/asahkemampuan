'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff, ArrowRight, Mail, Lock, User, CheckCircle, BookOpen, ChevronDown, Gift, PenTool } from 'lucide-react';
import apiClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaketOption {
  id: number;
  judul: string;
  is_gratis: boolean;
  harga: number;
  kategori?: { nama: string };
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', paket_id: '', role: 'peserta' as 'peserta' | 'pembuat_soal' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paketList, setPaketList] = useState<PaketOption[]>([]);
  const [selectedPaket, setSelectedPaket] = useState<PaketOption | null>(null);


  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/paket-list');
        const json = await res.json();
        setPaketList(json.data || []);
      } catch (err) {
        console.error('Failed to fetch paket list:', err);
      }
    };
    fetchPaket();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePaketSelect = (paketId: string) => {
    setForm(prev => ({ ...prev, paket_id: paketId }));
    const p = paketList.find(pk => pk.id === Number(paketId));
    setSelectedPaket(p || null);
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = 'Nama wajib diisi';
    if (!form.email) newErrors.email = 'Email wajib diisi';
    if (!form.password) newErrors.password = 'Password wajib diisi';
    if (form.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = 'Password tidak sama';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, string> = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      };
      if (form.paket_id) {
        payload.paket_id = form.paket_id;
      }
      if (refCode) {
        payload.referral_code = refCode;
      }
      payload.role = form.role;
      await apiClient.post('/auth/register', payload);
      setIsSuccess(true);
      toast.success('Pendaftaran berhasil! Cek email Anda.');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = getErrorMessage(error);
      toast.error(msg);
      if (err.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(err.response.data.errors)) {
          serverErrors[key] = (val as string[])[0];
        }
        setErrors(serverErrors);
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    const isPremiumPaket = selectedPaket && !selectedPaket.is_gratis && selectedPaket.harga > 0;
    const isPembuatSoal = form.role === 'pembuat_soal';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="fixed top-0 right-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />

        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
              isPembuatSoal
                ? 'bg-gradient-to-br from-violet-400 to-purple-500 shadow-violet-500/30'
                : isPremiumPaket
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30'
            }`}>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil! 🎉</h2>

            {isPembuatSoal ? (
              <>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  Pendaftaran Anda sebagai <strong>Pembuat Soal</strong> telah diterima. Akun Anda akan diaktifkan setelah diverifikasi oleh admin.
                </p>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
                  <p className="text-violet-800 text-sm font-medium">✍️ Role: Pembuat Soal</p>
                  <p className="text-violet-600 text-xs mt-1">Anda bisa membuat soal dan mendapatkan komisi dari paket yang terjual.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-amber-800 text-sm font-medium">⏳ Status: Menunggu Persetujuan Admin</p>
                  <p className="text-amber-600 text-xs mt-1">Cek email <strong>{form.email}</strong> untuk detail pendaftaran.</p>
                </div>
                <Link href="/login" className="btn-md btn-primary w-full justify-center">
                  Kembali ke Login <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : isPremiumPaket ? (
              <>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  Akun Anda telah <strong>langsung aktif</strong>. Silakan login untuk melakukan pembayaran paket.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-left">
                  <p className="text-sm font-semibold text-amber-800 mb-1">📦 {selectedPaket.judul}</p>
                  <p className="text-lg font-bold text-amber-700">{formatRupiah(selectedPaket.harga)}</p>
                  <p className="text-xs text-amber-600 mt-1">💳 Login dan lakukan pembayaran untuk mengakses paket</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <p className="text-green-700 text-sm font-medium">✅ Akun langsung aktif — bisa login sekarang!</p>
                </div>
                <Link href="/login" className="btn-md w-full justify-center bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-200/50 flex items-center gap-2">
                  Login & Bayar Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  Akun Anda telah berhasil dibuat. Silakan tunggu persetujuan dari <strong>admin</strong>.
                </p>
                {selectedPaket && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
                    <p className="text-sm font-semibold text-blue-800 mb-1">📦 Paket: {selectedPaket.judul}</p>
                    <p className="text-xs text-blue-600">✅ Gratis — Akses diberikan setelah admin menyetujui</p>
                  </div>
                )}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-amber-800 text-sm font-medium">⏳ Status: Menunggu Persetujuan Admin</p>
                  <p className="text-amber-600 text-xs mt-1">Cek email <strong>{form.email}</strong> untuk detail pendaftaran.</p>
                </div>
                <Link href="/login" className="btn-md btn-primary w-full justify-center">
                  Kembali ke Login <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}

            <p className="text-xs text-slate-400 mt-4">📧 Email notifikasi telah dikirim ke {form.email}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="fixed top-0 right-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-extrabold text-slate-800 text-xl tracking-tight">Asah<span className="text-blue-600">Kemampuan</span></p>
              <p className="text-xs text-slate-500">Platform Ujian Online</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Buat Akun</h2>
          <p className="text-slate-500 text-sm mb-5">Daftar untuk mulai tryout online</p>

          {refCode && (
            <div className="mb-5 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <p className="text-purple-700 text-sm">
                Anda mendaftar dengan kode referral <strong className="font-mono">{refCode}</strong>
              </p>
            </div>
          )}

          {errors.general && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Daftar Sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: 'peserta', paket_id: '' }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.role === 'peserta'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <User className={`w-5 h-5 mb-1 ${form.role === 'peserta' ? 'text-blue-600' : 'text-slate-400'}`} />
                <p className={`text-sm font-semibold ${form.role === 'peserta' ? 'text-blue-700' : 'text-slate-600'}`}>Peserta</p>
                <p className="text-xs text-slate-400">Ikuti tryout online</p>
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: 'pembuat_soal', paket_id: '' }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.role === 'pembuat_soal'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <PenTool className={`w-5 h-5 mb-1 ${form.role === 'pembuat_soal' ? 'text-violet-600' : 'text-slate-400'}`} />
                <p className={`text-sm font-semibold ${form.role === 'pembuat_soal' ? 'text-violet-700' : 'text-slate-600'}`}>Pembuat Soal</p>
                <p className="text-xs text-slate-400">Buat soal & dapatkan komisi</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="nama@email.com"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Paket Selection - only for peserta */}
            {form.role === 'peserta' && paketList.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Pilih Paket Tryout <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={form.paket_id}
                    onChange={(e) => handlePaketSelect(e.target.value)}
                    className="input pl-10 pr-8 appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="">-- Pilih paket yang ingin diakses --</option>
                    {paketList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.judul} {!p.is_gratis && p.harga > 0 ? `(Rp ${p.harga.toLocaleString('id-ID')})` : '(Gratis)'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {selectedPaket && !selectedPaket.is_gratis && selectedPaket.harga > 0 && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      💳 Paket berbayar: <strong>{formatRupiah(selectedPaket.harga)}</strong> — Pembayaran dilakukan setelah akun disetujui admin
                    </p>
                  </div>
                )}
                {selectedPaket && (selectedPaket.is_gratis || selectedPaket.harga <= 0) && (
                  <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700">✅ Paket gratis — Akses diberikan setelah admin menyetujui</p>
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={(e) => handleChange('password_confirmation', e.target.value)}
                  placeholder="Ulangi password"
                  className={`input pl-10 ${errors.password_confirmation ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-md btn-primary w-full py-3 text-base mt-2">
              {isLoading ? (
                <><span className="spinner w-4 h-4" />Mendaftar...</>
              ) : (
                <>Daftar <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {form.role === 'pembuat_soal' && (
            <div className="mt-4 p-3 bg-violet-50 rounded-xl border border-violet-100">
              <p className="text-xs text-violet-700 leading-relaxed">
                ✍️ Sebagai <strong>Pembuat Soal</strong>, Anda bisa membuat soal dan mendapatkan komisi dari setiap paket yang terjual. Soal yang Anda buat akan diverifikasi terlebih dahulu oleh tim verifikator.
              </p>
            </div>
          )}

          {form.role === 'peserta' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                ℹ️ Setelah mendaftar, akun Anda akan ditinjau oleh admin. Anda akan menerima notifikasi melalui email.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="spinner w-8 h-8"></span></div>}>
      <RegisterContent />
    </Suspense>
  );
}
