'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Trophy, ArrowRight, CheckCircle, Star, Zap, Users, Eye, EyeOff, Lock, Mail, User, Laptop, RefreshCw, Clock, Target, BarChart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Outfit } from 'next/font/google';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const outfit = Outfit({ subsets: ['latin'], weight: ['600', '700', '800', '900'] });

const features = [
  { icon: Laptop, title: 'Belajar kapan saja, di mana saja, HP atau laptop', desc: 'Ngerjain try out, baca materi dan nonton video bisa diakses pake handphone dan laptop.', color: 'bg-green-100 text-green-600' },
  { icon: RefreshCw, title: 'Materi ngikutin update soal, nggak ketinggalan', desc: 'Kami selalu menyesuaikan dengan kisi-kisi terbaru di setiap tahunnya.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Users, title: 'Pengajar berpengalaman yang sabar & nggak bikin boring', desc: 'Silakan curhat kekhawatiranmu kepada kami untuk diberikan solusi yang terbaik.', color: 'bg-amber-100 text-amber-600' },
  { icon: Clock, title: 'Bantu kamu bagi waktu belajar yang efektif', desc: 'Kamu bisa lihat berapa lama waktu yang kamu habiskan buat menjawab soal.', color: 'bg-blue-100 text-blue-600' },
  { icon: Target, title: 'Lihat posisi kamu di antara ribuan peserta', desc: 'Ukur kemampuanmu dengan berkompetisi bersama pengguna lainnya se-Indonesia.', color: 'bg-indigo-100 text-indigo-600' },
  { icon: BarChart, title: 'Tahu persis bagian mana yang perlu diperbaiki', desc: 'Evaluasi hasil belajar kamu dengan grafik super detail dan informatif.', color: 'bg-teal-100 text-teal-600' },
];

// Categories removed from static, fetched dynamically

const defaultSlideTexts = [
  'Persiapkan Ujian',
  'Asah Kemampuan',
  'Raih Mimpimu',
  'Tingkatkan Karir'
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Landing Settings State
  const [settings, setSettings] = useState<any>({});
  const [testimonis, setTestimonis] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const slideTexts = settings.hero_slides || defaultSlideTexts;
  const heroSubtitle = settings.hero_subtitle || 'Platform Tryout Online Terpercaya #1';
  const heroDescription = settings.hero_description || 'Latihan soal online dengan ribuan bank soal, timer real-time, dan analisis hasil yang mendalam. Raih nilai terbaik bersama Asah Kemampuan.';
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [resSettings, resTesti, resCat] = await Promise.all([
          apiClient.get('/landing-settings'),
          apiClient.get('/testimoni'),
          apiClient.get('/kategori')
        ]);
        if (resSettings.data.data) {
          setSettings(resSettings.data.data);
        }
        if (resTesti.data.data) {
          setTestimonis(resTesti.data.data);
        }
        if (resCat.data.data) {
          setCategories(resCat.data.data);
        }
      } catch (err) {
        console.error('Failed to load landing data', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slideTexts.length]);

  // Quick Register State
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!form.name || !form.email || !form.password) {
      setRegError('Semua kolom wajib diisi');
      return;
    }
    if (form.password.length < 8) {
      setRegError('Password minimal 8 karakter');
      return;
    }

    setIsRegLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password,
        role: 'peserta'
      };
      await apiClient.post('/auth/register', payload);
      toast.success('Pendaftaran berhasil! Silakan login untuk melanjutkan.');
      router.push('/login');
    } catch (error) {
      const msg = getErrorMessage(error);
      setRegError(msg);
      toast.error(msg);
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-xl tracking-tight">Asah<span className="text-green-600">Kemampuan</span></span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-green-600">Beranda</Link>
            <Link href="#keunggulan" className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">Keunggulan</Link>
            <Link href="#testimoni" className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">Testimoni</Link>
            <Link href="#paket" className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">Paket</Link>
            <Link href="#blog" className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-md btn-primary bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30 border-0">
                Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-green-600 px-4 py-2 hidden sm:block transition-colors">Masuk</Link>
                <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  Coba Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-white via-green-50 to-emerald-100 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text Slider & Copy */}
            <div className="text-left max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-green-200 text-green-700 text-sm font-bold mb-6 shadow-sm backdrop-blur-sm">
                <Star className="w-4 h-4 text-orange-500" />
                {heroSubtitle}
              </div>
              
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight mb-8 ${outfit.className}`}>
                <span className="block mb-2">Bersama Kami,</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 transition-opacity duration-500 py-1 min-h-[60px] sm:min-h-[72px] lg:min-h-[88px]">
                  {slideTexts[currentSlide]}
                </span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 text-slate-700">Dengan Lebih Cerdas</span>
              </h1>
              
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                {heroDescription}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-md">
                {[
                  { val: settings.stats_1_value || '10K+', label: settings.stats_1_label || 'Peserta' },
                  { val: settings.stats_2_value || '500+', label: settings.stats_2_label || 'Soal Latihan' },
                  { val: settings.stats_3_value || '95%', label: settings.stats_3_label || 'Tingkat Kelulusan' },
                ].map((s, i) => (
                  <div key={i} className="text-left border-l-4 border-green-500 pl-4">
                    <p className="text-2xl font-extrabold text-slate-800">{s.val}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Daftar Sekarang</h3>
                  <p className="text-slate-500 text-sm mt-1">Buat akun peserta secara gratis</p>
                </div>

                {regError && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleQuickRegister} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Masukkan nama"
                        className="input pl-10 bg-white/70 focus:bg-white w-full border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                        disabled={isRegLoading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="nama@email.com"
                        className="input pl-10 bg-white/70 focus:bg-white w-full border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                        disabled={isRegLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Minimal 8 karakter"
                        className="input pl-10 pr-10 bg-white/70 focus:bg-white w-full border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                        disabled={isRegLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4 border-0"
                  >
                    {isRegLoading ? (
                      <><span className="spinner w-4 h-4 border-white" /> Memproses...</>
                    ) : (
                      <>Daftar Sebagai Peserta <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
                
                <p className="text-center text-xs text-slate-500 mt-5 leading-relaxed">
                  Sudah punya akun? <Link href="/login" className="text-green-600 font-semibold hover:underline">Masuk di sini</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white" id="keunggulan">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Kenapa Ribuan Orang Pilih Belajar di Asah Kemampuan?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Fitur lengkap yang dirancang khusus untuk memaksimalkan persiapan ujianmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card-hover text-left p-8 rounded-3xl border border-slate-100 bg-white hover:border-green-200 shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 shadow-sm`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 mb-3 text-lg leading-snug">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      {testimonis.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-100" id="testimoni">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Apa Kata Mereka?</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Dengarkan langsung dari mereka yang telah merasakan manfaatnya</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {testimonis.map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
                  <div className="mb-6 relative flex-grow">
                    <span className="absolute -top-4 -left-2 text-6xl text-green-200/50 font-serif">&quot;</span>
                    <p className="text-slate-600 relative z-10 italic leading-relaxed text-sm">
                      {t.content}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <p className="font-bold text-slate-800">{t.name}</p>
                    {t.role && <p className="text-xs text-green-600 font-semibold mt-0.5">{t.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-24 bg-white border-y border-slate-100" id="paket">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Kategori Tryout</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Pilih kategori yang sesuai dengan tujuan dan persiapan ujian kamu</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 12).map((c, i) => {
              // Generate dynamic color based on index
              const colors = [
                'from-green-500 to-emerald-500',
                'from-emerald-500 to-teal-500',
                'from-teal-500 to-green-600',
                'from-blue-500 to-cyan-500',
                'from-indigo-500 to-blue-500',
                'from-cyan-500 to-blue-500'
              ];
              const bgGradient = colors[i % colors.length];
              
              return (
                <Link key={i} href={`/kategori/${c.id}`} className="group card-hover p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center gap-5 hover:border-green-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    {c.icon || '📚'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-green-600 transition-colors">{c.nama}</h3>
                    <p className="text-sm text-slate-500">{c.paket_count || 0} Paket Tryout</p>
                  </div>
                </Link>
              );
            })}
            
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Belum ada kategori yang ditambahkan.
              </div>
            )}
          </div>
          
          {categories.length > 0 && (
            <div className="text-center mt-12">
              <button className="btn-lg bg-green-50 text-green-700 hover:bg-green-100 font-bold rounded-full">
                Lihat Semua Kategori
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Mulai Berlatih?</h2>
          <p className="text-green-100 mb-8 text-lg">Bergabung dengan ribuan peserta yang sudah berhasil meraih nilai terbaik mereka.</p>
          <Link href="/register" className="bg-white text-green-600 hover:bg-green-50 rounded-full px-8 py-4 font-bold inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-transform duration-200">
            Daftar Sekarang — Gratis! <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">Asah Kemampuan</span>
        </div>
        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Asah Kemampuan. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  );
}
