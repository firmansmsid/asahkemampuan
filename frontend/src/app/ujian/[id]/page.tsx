'use client';

import { useEffect, useCallback, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import Timer from '@/components/ujian/Timer';
import SoalCard from '@/components/ujian/SoalCard';
import SoalNavigator from '@/components/ujian/SoalNavigator';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useUjianStore } from '@/store/ujianStore';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function UjianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sesiId = parseInt(id);
  const router = useRouter();
  const {
    sesi, soalList, currentIndex, jawaban,
    loadSesi, nextSoal, prevSoal, submitUjian, isLoading, isSubmitting,
  } = useUjianStore();
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (sesiId) loadSesi(sesiId);
  }, [sesiId]);

  const handleTimeUp = useCallback(async () => {
    toast.error('Waktu habis! Ujian disubmit otomatis.');
    try {
      const hasil = await submitUjian(sesiId);
      router.push(`/dashboard/hasil/${hasil.id}`);
    } catch {
      router.push('/dashboard');
    }
  }, [sesiId]);

  const handleSubmit = async () => {
    const unanswered = soalList.length - Object.keys(jawaban).length;
    if (unanswered > 0) {
      const ok = window.confirm(`Masih ada ${unanswered} soal belum dijawab. Yakin ingin submit?`);
      if (!ok) return;
    }
    try {
      const hasil = await submitUjian(sesiId);
      toast.success('Ujian berhasil disubmit!');
      router.push(`/dashboard/hasil/${hasil.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Memuat soal ujian..." />
      </div>
    );
  }

  if (!sesi || soalList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="font-semibold text-slate-700">Sesi ujian tidak ditemukan</p>
        <button onClick={() => router.push('/dashboard')} className="btn-md btn-primary">Kembali ke Dashboard</button>
      </div>
    );
  }

  const answeredCount = Object.keys(jawaban).length;
  const progress = Math.round((answeredCount / soalList.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Exam Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-800 text-sm truncate">{sesi.paket?.judul || 'Ujian'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-slate-500">{answeredCount}/{soalList.length}</span>
            </div>
          </div>

          <Timer sesiId={sesiId} onTimeUp={handleTimeUp} />

          <button
            onClick={() => setShowConfirmSubmit(true)}
            disabled={isSubmitting}
            className="btn-md btn-primary hidden sm:inline-flex"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Soal */}
        <div className="card">
          <SoalCard sesiId={sesiId} />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            <button
              onClick={prevSoal}
              disabled={currentIndex === 0}
              className="btn-md btn-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            <span className="text-sm text-slate-500 font-medium">
              {currentIndex + 1} / {soalList.length}
            </span>

            {currentIndex < soalList.length - 1 ? (
              <button onClick={nextSoal} className="btn-md btn-primary">
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setShowConfirmSubmit(true)} disabled={isSubmitting} className="btn-md btn-primary">
                <Send className="w-4 h-4" /> Submit Ujian
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigator */}
        <div className="space-y-4">
          <SoalNavigator sesiId={sesiId} />
          <button
            onClick={() => setShowConfirmSubmit(true)}
            disabled={isSubmitting}
            className="btn-md btn-danger w-full lg:flex hidden"
          >
            <Send className="w-4 h-4" />
            Submit Ujian
          </button>
        </div>
      </div>

      {/* Mobile submit bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
        <button onClick={() => setShowConfirmSubmit(true)} disabled={isSubmitting} className="btn-md btn-danger w-full">
          <Send className="w-4 h-4" /> Submit Ujian
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-center text-lg mb-2">Konfirmasi Submit</h3>
            <p className="text-slate-500 text-sm text-center mb-2">
              Kamu telah menjawab <strong>{answeredCount}</strong> dari <strong>{soalList.length}</strong> soal.
            </p>
            {soalList.length - answeredCount > 0 && (
              <p className="text-red-500 text-sm text-center mb-4 font-medium">
                {soalList.length - answeredCount} soal belum dijawab!
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirmSubmit(false)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={() => { setShowConfirmSubmit(false); handleSubmit(); }} disabled={isSubmitting} className="btn-md btn-primary flex-1">
                {isSubmitting ? <><span className="spinner w-4 h-4" />Submitting...</> : 'Ya, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
